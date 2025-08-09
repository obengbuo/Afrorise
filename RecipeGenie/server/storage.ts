import {
  users,
  profiles,
  sessions,
  projects,
  projectMembers,
  tasks,
  gigs,
  gigApplications,
  messageThreads,
  messages,
  reviews,
  auditLogs,
  availability,
  type User,
  type UpsertUser,
  type Profile,
  type InsertProfile,
  type Session,
  type InsertSession,
  type Project,
  type InsertProject,
  type ProjectMember,
  type Task,
  type InsertTask,
  type Gig,
  type InsertGig,
  type GigApplication,
  type InsertGigApplication,
  type MessageThread,
  type InsertMessageThread,
  type Message,
  type InsertMessage,
  type Review,
  type InsertReview,
  type AuditLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, like, desc, asc, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Profile operations
  getProfile(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, profile: Partial<InsertProfile>): Promise<Profile>;
  
  // Mentor operations
  getMentors(filters?: {
    industries?: string[];
    skills?: string[];
    languages?: string[];
    ratingMin?: number;
  }): Promise<Array<User & { profile: Profile | null; avgRating?: number }>>;
  getMentorById(id: string): Promise<(User & { profile: Profile | null; avgRating?: number }) | undefined>;
  approveMentor(userId: string): Promise<void>;
  
  // Session operations
  createSession(session: InsertSession): Promise<Session>;
  getUserSessions(userId: string, role: 'mentor' | 'mentee'): Promise<Session[]>;
  updateSessionStatus(sessionId: string, status: string): Promise<void>;
  
  // Project operations
  getProjects(): Promise<Array<Project & { owner: User; memberCount: number }>>;
  getProjectById(id: string): Promise<(Project & { owner: User; members: Array<ProjectMember & { user: User }> }) | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  addProjectMember(projectId: string, userId: string, role?: string): Promise<ProjectMember>;
  getProjectTasks(projectId: string): Promise<Array<Task & { assignee: User | null }>>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(taskId: string, updates: Partial<InsertTask>): Promise<Task>;
  
  // Gig operations
  getGigs(): Promise<Array<Gig & { creator: User; applicationCount: number }>>;
  getGigById(id: string): Promise<(Gig & { creator: User; applications: Array<GigApplication & { applicant: User }> }) | undefined>;
  createGig(gig: InsertGig): Promise<Gig>;
  applyToGig(application: InsertGigApplication): Promise<GigApplication>;
  
  // Messaging operations
  getUserThreads(userId: string): Promise<MessageThread[]>;
  getThreadMessages(threadId: string): Promise<Array<Message & { sender: User }>>;
  createThread(thread: InsertMessageThread): Promise<MessageThread>;
  sendMessage(message: InsertMessage): Promise<Message>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getMentorReviews(mentorId: string): Promise<Array<Review & { mentee: User }>>;
  
  // Admin operations
  getAllUsers(): Promise<Array<User & { profile: Profile | null }>>;
  updateUserRole(userId: string, role: string): Promise<void>;
  createAuditLog(log: { actorId?: string; action: string; entity: string; entityId: string }): Promise<AuditLog>;
  getAuditLogs(): Promise<Array<AuditLog & { actor: User | null }>>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Profile operations
  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const [created] = await db.insert(profiles).values(profile).returning();
    return created;
  }

  async updateProfile(userId: string, profile: Partial<InsertProfile>): Promise<Profile> {
    const [updated] = await db
      .update(profiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return updated;
  }

  // Mentor operations
  async getMentors(filters?: {
    industries?: string[];
    skills?: string[];
    languages?: string[];
    ratingMin?: number;
  }): Promise<Array<User & { profile: Profile | null; avgRating?: number }>> {
    let query = db
      .select({
        user: users,
        profile: profiles,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(and(
        eq(users.role, 'MENTOR'),
        eq(profiles.isMentorApproved, true)
      ));

    const results = await query;
    
    // Calculate average ratings for each mentor
    const mentorsWithRatings = await Promise.all(
      results.map(async (result) => {
        const avgRatingResult = await db
          .select()
          .from(reviews)
          .where(eq(reviews.mentorId, result.user.id));
        
        const avgRating = avgRatingResult.length > 0
          ? avgRatingResult.reduce((sum, r) => sum + r.rating, 0) / avgRatingResult.length
          : 0;

        return {
          ...result.user,
          profile: result.profile,
          avgRating,
        };
      })
    );

    return mentorsWithRatings;
  }

  async getMentorById(id: string): Promise<(User & { profile: Profile | null; avgRating?: number }) | undefined> {
    const [result] = await db
      .select({
        user: users,
        profile: profiles,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(users.id, id));

    if (!result) return undefined;

    const avgRatingResult = await db
      .select()
      .from(reviews)
      .where(eq(reviews.mentorId, id));
    
    const avgRating = avgRatingResult.length > 0
      ? avgRatingResult.reduce((sum, r) => sum + r.rating, 0) / avgRatingResult.length
      : 0;

    return {
      ...result.user,
      profile: result.profile,
      avgRating,
    };
  }

  async approveMentor(userId: string): Promise<void> {
    await db
      .update(profiles)
      .set({ isMentorApproved: true })
      .where(eq(profiles.userId, userId));
  }

  // Session operations
  async createSession(session: InsertSession): Promise<Session> {
    const [created] = await db.insert(sessions).values(session).returning();
    return created;
  }

  async getUserSessions(userId: string, role: 'mentor' | 'mentee'): Promise<Session[]> {
    const condition = role === 'mentor' 
      ? eq(sessions.mentorId, userId)
      : eq(sessions.menteeId, userId);
    
    return await db
      .select()
      .from(sessions)
      .where(condition)
      .orderBy(desc(sessions.startsAt));
  }

  async updateSessionStatus(sessionId: string, status: string): Promise<void> {
    await db
      .update(sessions)
      .set({ status: status as any })
      .where(eq(sessions.id, sessionId));
  }

  // Project operations
  async getProjects(): Promise<Array<Project & { owner: User; memberCount: number }>> {
    const results = await db
      .select({
        project: projects,
        owner: users,
      })
      .from(projects)
      .leftJoin(users, eq(projects.ownerId, users.id))
      .orderBy(desc(projects.createdAt));

    return await Promise.all(
      results.map(async (result) => {
        const memberCount = await db
          .select()
          .from(projectMembers)
          .where(eq(projectMembers.projectId, result.project.id));
        
        return {
          ...result.project,
          owner: result.owner!,
          memberCount: memberCount.length,
        };
      })
    );
  }

  async getProjectById(id: string): Promise<(Project & { owner: User; members: Array<ProjectMember & { user: User }> }) | undefined> {
    const [projectResult] = await db
      .select({
        project: projects,
        owner: users,
      })
      .from(projects)
      .leftJoin(users, eq(projects.ownerId, users.id))
      .where(eq(projects.id, id));

    if (!projectResult) return undefined;

    const membersResult = await db
      .select({
        member: projectMembers,
        user: users,
      })
      .from(projectMembers)
      .leftJoin(users, eq(projectMembers.userId, users.id))
      .where(eq(projectMembers.projectId, id));

    return {
      ...projectResult.project,
      owner: projectResult.owner!,
      members: membersResult.map(m => ({
        ...m.member,
        user: m.user!,
      })),
    };
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [created] = await db.insert(projects).values(project).returning();
    
    // Add owner as a member
    await db.insert(projectMembers).values({
      projectId: created.id,
      userId: project.ownerId,
      role: 'OWNER',
    });

    return created;
  }

  async addProjectMember(projectId: string, userId: string, role = 'CONTRIBUTOR'): Promise<ProjectMember> {
    const [member] = await db.insert(projectMembers).values({
      projectId,
      userId,
      role: role as any,
    }).returning();
    return member;
  }

  async getProjectTasks(projectId: string): Promise<Array<Task & { assignee: User | null }>> {
    const results = await db
      .select({
        task: tasks,
        assignee: users,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assigneeId, users.id))
      .where(eq(tasks.projectId, projectId))
      .orderBy(asc(tasks.createdAt));

    return results.map(result => ({
      ...result.task,
      assignee: result.assignee,
    }));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [created] = await db.insert(tasks).values(task).returning();
    return created;
  }

  async updateTask(taskId: string, updates: Partial<InsertTask>): Promise<Task> {
    const [updated] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, taskId))
      .returning();
    return updated;
  }

  // Gig operations
  async getGigs(): Promise<Array<Gig & { creator: User; applicationCount: number }>> {
    const results = await db
      .select({
        gig: gigs,
        creator: users,
      })
      .from(gigs)
      .leftJoin(users, eq(gigs.creatorId, users.id))
      .where(eq(gigs.status, 'OPEN'))
      .orderBy(desc(gigs.createdAt));

    return await Promise.all(
      results.map(async (result) => {
        const applicationCount = await db
          .select()
          .from(gigApplications)
          .where(eq(gigApplications.gigId, result.gig.id));
        
        return {
          ...result.gig,
          creator: result.creator!,
          applicationCount: applicationCount.length,
        };
      })
    );
  }

  async getGigById(id: string): Promise<(Gig & { creator: User; applications: Array<GigApplication & { applicant: User }> }) | undefined> {
    const [gigResult] = await db
      .select({
        gig: gigs,
        creator: users,
      })
      .from(gigs)
      .leftJoin(users, eq(gigs.creatorId, users.id))
      .where(eq(gigs.id, id));

    if (!gigResult) return undefined;

    const applicationsResult = await db
      .select({
        application: gigApplications,
        applicant: users,
      })
      .from(gigApplications)
      .leftJoin(users, eq(gigApplications.applicantId, users.id))
      .where(eq(gigApplications.gigId, id));

    return {
      ...gigResult.gig,
      creator: gigResult.creator!,
      applications: applicationsResult.map(a => ({
        ...a.application,
        applicant: a.applicant!,
      })),
    };
  }

  async createGig(gig: InsertGig): Promise<Gig> {
    const [created] = await db.insert(gigs).values(gig).returning();
    return created;
  }

  async applyToGig(application: InsertGigApplication): Promise<GigApplication> {
    const [created] = await db.insert(gigApplications).values(application).returning();
    return created;
  }

  // Messaging operations
  async getUserThreads(userId: string): Promise<MessageThread[]> {
    return await db
      .select()
      .from(messageThreads)
      .where(like(messageThreads.participantIds, `%${userId}%`))
      .orderBy(desc(messageThreads.updatedAt));
  }

  async getThreadMessages(threadId: string): Promise<Array<Message & { sender: User }>> {
    const results = await db
      .select({
        message: messages,
        sender: users,
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.threadId, threadId))
      .orderBy(asc(messages.createdAt));

    return results.map(result => ({
      ...result.message,
      sender: result.sender!,
    }));
  }

  async createThread(thread: InsertMessageThread): Promise<MessageThread> {
    const [created] = await db.insert(messageThreads).values(thread).returning();
    return created;
  }

  async sendMessage(message: InsertMessage): Promise<Message> {
    const [created] = await db.insert(messages).values(message).returning();
    
    // Update thread's updatedAt
    await db
      .update(messageThreads)
      .set({ updatedAt: new Date() })
      .where(eq(messageThreads.id, message.threadId));

    return created;
  }

  // Review operations
  async createReview(review: InsertReview): Promise<Review> {
    const [created] = await db.insert(reviews).values(review).returning();
    return created;
  }

  async getMentorReviews(mentorId: string): Promise<Array<Review & { mentee: User }>> {
    const results = await db
      .select({
        review: reviews,
        mentee: users,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.menteeId, users.id))
      .where(eq(reviews.mentorId, mentorId))
      .orderBy(desc(reviews.createdAt));

    return results.map(result => ({
      ...result.review,
      mentee: result.mentee!,
    }));
  }

  // Admin operations
  async getAllUsers(): Promise<Array<User & { profile: Profile | null }>> {
    const results = await db
      .select({
        user: users,
        profile: profiles,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .orderBy(desc(users.createdAt));

    return results.map(result => ({
      ...result.user,
      profile: result.profile,
    }));
  }

  async updateUserRole(userId: string, role: string): Promise<void> {
    await db
      .update(users)
      .set({ role: role as any })
      .where(eq(users.id, userId));
  }

  async createAuditLog(log: { actorId?: string; action: string; entity: string; entityId: string }): Promise<AuditLog> {
    const [created] = await db.insert(auditLogs).values(log).returning();
    return created;
  }

  async getAuditLogs(): Promise<Array<AuditLog & { actor: User | null }>> {
    const results = await db
      .select({
        log: auditLogs,
        actor: users,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.actorId, users.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(100);

    return results.map(result => ({
      ...result.log,
      actor: result.actor,
    }));
  }
}

export const storage = new DatabaseStorage();
