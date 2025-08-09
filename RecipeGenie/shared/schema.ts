import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Enums
export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'MENTOR', 'MENTEE']);
export const sessionTypeEnum = pgEnum('session_type', ['MENTORSHIP', 'RESUME_REVIEW', 'MOCK_INTERVIEW']);
export const sessionStatusEnum = pgEnum('session_status', ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']);
export const taskStatusEnum = pgEnum('task_status', ['BACKLOG', 'IN_PROGRESS', 'REVIEW', 'DONE']);
export const projectRoleEnum = pgEnum('project_role', ['OWNER', 'MAINTAINER', 'CONTRIBUTOR']);
export const gigStatusEnum = pgEnum('gig_status', ['OPEN', 'CLOSED']);
export const industryEnum = pgEnum('industry', [
  'TECHNOLOGY', 'FINANCE', 'HEALTHCARE', 'MARKETING', 'SALES', 'EDUCATION', 
  'CONSULTING', 'LEGAL', 'ENGINEERING', 'DESIGN', 'OTHER'
]);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default('MENTEE').notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  location: varchar("location"),
  headline: varchar("headline"),
  bio: text("bio"),
  skills: text("skills").array(),
  industries: industryEnum("industries").array(),
  linkedin: varchar("linkedin"),
  yearsExperience: integer("years_experience"),
  languages: text("languages").array(),
  // Mentor-specific fields
  availability: text("availability"),
  meetingLink: varchar("meeting_link"),
  specialties: text("specialties").array(),
  // Mentee-specific fields
  school: varchar("school"),
  schoolYear: varchar("school_year"),
  major: varchar("major"),
  minor: varchar("minor"),
  currentProfession: varchar("current_profession"),
  targetProfession: varchar("target_profession"),
  isMentorApproved: boolean("is_mentor_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const availability = pgTable("availability", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mentorId: varchar("mentor_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  startTime: varchar("start_time").notNull(), // "09:00"
  endTime: varchar("end_time").notNull(), // "17:00"
  timezone: varchar("timezone").notNull().default('UTC'),
});

export const mentoringSessions = pgTable("mentoring_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mentorId: varchar("mentor_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  menteeId: varchar("mentee_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: sessionTypeEnum("type").notNull(),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at").notNull(),
  status: sessionStatusEnum("status").default('PENDING').notNull(),
  notes: text("notes"),
  externalCalendarUrl: varchar("external_calendar_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title").notNull(),
  description: text("description"),
  tags: text("tags").array(),
  repoUrl: varchar("repo_url"),
  driveUrl: varchar("drive_url"),
  visibility: varchar("visibility").default('PRIVATE').notNull(), // PRIVATE, ORG
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projectMembers = pgTable("project_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: projectRoleEnum("role").default('CONTRIBUTOR').notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  title: varchar("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").default('BACKLOG').notNull(),
  assigneeId: varchar("assignee_id").references(() => users.id),
  dueDate: timestamp("due_date"),
  labels: text("labels").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const gigs = pgTable("gigs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title").notNull(),
  description: text("description"),
  budget: integer("budget"),
  currency: varchar("currency").default('USD'),
  tags: text("tags").array(),
  isRemote: boolean("is_remote").default(true),
  location: varchar("location"),
  status: gigStatusEnum("status").default('OPEN').notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const gigApplications = pgTable("gig_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gigId: varchar("gig_id").notNull().references(() => gigs.id, { onDelete: 'cascade' }),
  applicantId: varchar("applicant_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messageThreads = pgTable("message_threads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  isProjectThread: boolean("is_project_thread").default(false),
  projectId: varchar("project_id").references(() => projects.id),
  participantIds: text("participant_ids").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  threadId: varchar("thread_id").notNull().references(() => messageThreads.id, { onDelete: 'cascade' }),
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mentorId: varchar("mentor_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  menteeId: varchar("mentee_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  actorId: varchar("actor_id").references(() => users.id),
  action: varchar("action").notNull(),
  entity: varchar("entity").notNull(),
  entityId: varchar("entity_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  mentorSessions: many(mentoringSessions, {
    relationName: "mentorSessions",
  }),
  menteeSessions: many(mentoringSessions, {
    relationName: "menteeSessions",
  }),
  ownedProjects: many(projects),
  projectMemberships: many(projectMembers),
  createdGigs: many(gigs),
  gigApplications: many(gigApplications),
  sentMessages: many(messages),
  mentorReviews: many(reviews, {
    relationName: "mentorReviews",
  }),
  menteeReviews: many(reviews, {
    relationName: "menteeReviews",
  }),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const mentioringSessionsRelations = relations(mentoringSessions, ({ one }) => ({
  mentor: one(users, {
    fields: [mentoringSessions.mentorId],
    references: [users.id],
    relationName: "mentorSessions",
  }),
  mentee: one(users, {
    fields: [mentoringSessions.menteeId],
    references: [users.id],
    relationName: "menteeSessions",
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  members: many(projectMembers),
  tasks: many(tasks),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectMembers.userId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
  }),
}));

export const gigsRelations = relations(gigs, ({ one, many }) => ({
  creator: one(users, {
    fields: [gigs.creatorId],
    references: [users.id],
  }),
  applications: many(gigApplications),
}));

export const gigApplicationsRelations = relations(gigApplications, ({ one }) => ({
  gig: one(gigs, {
    fields: [gigApplications.gigId],
    references: [gigs.id],
  }),
  applicant: one(users, {
    fields: [gigApplications.applicantId],
    references: [users.id],
  }),
}));

export const messageThreadsRelations = relations(messageThreads, ({ one, many }) => ({
  project: one(projects, {
    fields: [messageThreads.projectId],
    references: [projects.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  thread: one(messageThreads, {
    fields: [messages.threadId],
    references: [messageThreads.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  mentor: one(users, {
    fields: [reviews.mentorId],
    references: [users.id],
    relationName: "mentorReviews",
  }),
  mentee: one(users, {
    fields: [reviews.menteeId],
    references: [users.id],
    relationName: "menteeReviews",
  }),
}));

// Insert schemas
export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSessionSchema = createInsertSchema(mentoringSessions).omit({
  id: true,
  createdAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGigSchema = createInsertSchema(gigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGigApplicationSchema = createInsertSchema(gigApplications).omit({
  id: true,
  createdAt: true,
});

export const insertMessageThreadSchema = createInsertSchema(messageThreads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Session = typeof mentoringSessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type ProjectMember = typeof projectMembers.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Gig = typeof gigs.$inferSelect;
export type InsertGig = z.infer<typeof insertGigSchema>;
export type GigApplication = typeof gigApplications.$inferSelect;
export type InsertGigApplication = z.infer<typeof insertGigApplicationSchema>;
export type MessageThread = typeof messageThreads.$inferSelect;
export type InsertMessageThread = z.infer<typeof insertMessageThreadSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
