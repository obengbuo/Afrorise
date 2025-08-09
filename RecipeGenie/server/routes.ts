import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { matchMentors } from "./services/matchingService";
import { sendEmail } from "./services/emailService";
import { 
  insertProfileSchema, 
  insertSessionSchema, 
  insertProjectSchema, 
  insertTaskSchema, 
  insertGigSchema, 
  insertGigApplicationSchema, 
  insertMessageSchema, 
  insertReviewSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const profile = await storage.getProfile(userId);
      res.json({ ...user, profile });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile routes
  app.post('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertProfileSchema.parse({ ...req.body, userId });
      
      const existingProfile = await storage.getProfile(userId);
      let profile;
      
      if (existingProfile) {
        profile = await storage.updateProfile(userId, profileData);
      } else {
        profile = await storage.createProfile(profileData);
      }
      
      await storage.createAuditLog({
        actorId: userId,
        action: existingProfile ? 'UPDATE' : 'CREATE',
        entity: 'profile',
        entityId: profile.id,
      });
      
      res.json(profile);
    } catch (error) {
      console.error("Error saving profile:", error);
      res.status(400).json({ message: "Failed to save profile" });
    }
  });

  // Mentor routes
  app.get('/api/mentors', async (req, res) => {
    try {
      const { industries, skills, languages, ratingMin } = req.query;
      
      const filters = {
        industries: industries ? (industries as string).split(',') : undefined,
        skills: skills ? (skills as string).split(',') : undefined,
        languages: languages ? (languages as string).split(',') : undefined,
        ratingMin: ratingMin ? parseInt(ratingMin as string) : undefined,
      };
      
      const mentors = await storage.getMentors(filters);
      res.json(mentors);
    } catch (error) {
      console.error("Error fetching mentors:", error);
      res.status(500).json({ message: "Failed to fetch mentors" });
    }
  });

  app.get('/api/mentors/:id', async (req, res) => {
    try {
      const mentor = await storage.getMentorById(req.params.id);
      if (!mentor) {
        return res.status(404).json({ message: "Mentor not found" });
      }
      res.json(mentor);
    } catch (error) {
      console.error("Error fetching mentor:", error);
      res.status(500).json({ message: "Failed to fetch mentor" });
    }
  });

  app.post('/api/match', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      
      if (!profile) {
        return res.status(400).json({ message: "Profile not found. Please complete your profile first." });
      }
      
      const matches = await matchMentors(profile);
      res.json(matches);
    } catch (error) {
      console.error("Error matching mentors:", error);
      res.status(500).json({ message: "Failed to match mentors" });
    }
  });

  // Session routes
  app.post('/api/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionData = insertSessionSchema.parse({ ...req.body, menteeId: userId });
      
      const session = await storage.createSession(sessionData);
      
      // Send email notifications
      const mentor = await storage.getUser(sessionData.mentorId);
      const mentee = await storage.getUser(userId);
      
      if (mentor && mentee) {
        await sendEmail({
          to: mentor.email!,
          subject: 'New Session Booking',
          text: `You have a new session booking from ${mentee.firstName} ${mentee.lastName}`,
        });
        
        await sendEmail({
          to: mentee.email!,
          subject: 'Session Booking Confirmation',
          text: `Your session booking has been confirmed`,
        });
      }
      
      await storage.createAuditLog({
        actorId: userId,
        action: 'CREATE',
        entity: 'session',
        entityId: session.id,
      });
      
      res.json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(400).json({ message: "Failed to create session" });
    }
  });

  app.get('/api/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { role } = req.query;
      
      const sessions = await storage.getUserSessions(userId, role as 'mentor' | 'mentee');
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.patch('/api/sessions/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { status } = req.body;
      await storage.updateSessionStatus(req.params.id, status);
      
      await storage.createAuditLog({
        actorId: req.user.claims.sub,
        action: 'UPDATE',
        entity: 'session',
        entityId: req.params.id,
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating session status:", error);
      res.status(400).json({ message: "Failed to update session status" });
    }
  });

  // Project routes
  app.get('/api/projects', async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get('/api/projects/:id', async (req, res) => {
    try {
      const project = await storage.getProjectById(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectData = insertProjectSchema.parse({ ...req.body, ownerId: userId });
      
      const project = await storage.createProject(projectData);
      
      await storage.createAuditLog({
        actorId: userId,
        action: 'CREATE',
        entity: 'project',
        entityId: project.id,
      });
      
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(400).json({ message: "Failed to create project" });
    }
  });

  app.post('/api/projects/:id/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const member = await storage.addProjectMember(req.params.id, userId);
      
      await storage.createAuditLog({
        actorId: userId,
        action: 'JOIN',
        entity: 'project',
        entityId: req.params.id,
      });
      
      res.json(member);
    } catch (error) {
      console.error("Error joining project:", error);
      res.status(400).json({ message: "Failed to join project" });
    }
  });

  app.get('/api/projects/:id/tasks', async (req, res) => {
    try {
      const tasks = await storage.getProjectTasks(req.params.id);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post('/api/projects/:id/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const taskData = insertTaskSchema.parse({ ...req.body, projectId: req.params.id });
      
      const task = await storage.createTask(taskData);
      
      await storage.createAuditLog({
        actorId: userId,
        action: 'CREATE',
        entity: 'task',
        entityId: task.id,
      });
      
      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(400).json({ message: "Failed to create task" });
    }
  });

  app.patch('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const task = await storage.updateTask(req.params.id, req.body);
      
      await storage.createAuditLog({
        actorId: req.user.claims.sub,
        action: 'UPDATE',
        entity: 'task',
        entityId: req.params.id,
      });
      
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(400).json({ message: "Failed to update task" });
    }
  });

  // Gig routes
  app.get('/api/gigs', async (req, res) => {
    try {
      const gigs = await storage.getGigs();
      res.json(gigs);
    } catch (error) {
      console.error("Error fetching gigs:", error);
      res.status(500).json({ message: "Failed to fetch gigs" });
    }
  });

  app.get('/api/gigs/:id', async (req, res) => {
    try {
      const gig = await storage.getGigById(req.params.id);
      if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
      }
      res.json(gig);
    } catch (error) {
      console.error("Error fetching gig:", error);
      res.status(500).json({ message: "Failed to fetch gig" });
    }
  });

  app.post('/api/gigs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const gigData = insertGigSchema.parse({ ...req.body, creatorId: userId });
      
      const gig = await storage.createGig(gigData);
      
      await storage.createAuditLog({
        actorId: userId,
        action: 'CREATE',
        entity: 'gig',
        entityId: gig.id,
      });
      
      res.json(gig);
    } catch (error) {
      console.error("Error creating gig:", error);
      res.status(400).json({ message: "Failed to create gig" });
    }
  });

  app.post('/api/gigs/:id/apply', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const applicationData = insertGigApplicationSchema.parse({
        ...req.body,
        gigId: req.params.id,
        applicantId: userId,
      });
      
      const application = await storage.applyToGig(applicationData);
      
      await storage.createAuditLog({
        actorId: userId,
        action: 'APPLY',
        entity: 'gig',
        entityId: req.params.id,
      });
      
      res.json(application);
    } catch (error) {
      console.error("Error applying to gig:", error);
      res.status(400).json({ message: "Failed to apply to gig" });
    }
  });

  // Messaging routes
  app.get('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { threadId } = req.query;
      
      if (threadId) {
        const messages = await storage.getThreadMessages(threadId as string);
        res.json(messages);
      } else {
        const threads = await storage.getUserThreads(userId);
        res.json(threads);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { threadId, content, recipientId } = req.body;
      
      let actualThreadId = threadId;
      
      // Create thread if it doesn't exist
      if (!threadId && recipientId) {
        const thread = await storage.createThread({
          isProjectThread: false,
          participantIds: [userId, recipientId],
        });
        actualThreadId = thread.id;
      }
      
      const messageData = insertMessageSchema.parse({
        threadId: actualThreadId,
        senderId: userId,
        content,
      });
      
      const message = await storage.sendMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(400).json({ message: "Failed to send message" });
    }
  });

  // Review routes
  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reviewData = insertReviewSchema.parse({ ...req.body, menteeId: userId });
      
      const review = await storage.createReview(reviewData);
      
      await storage.createAuditLog({
        actorId: userId,
        action: 'CREATE',
        entity: 'review',
        entityId: review.id,
      });
      
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(400).json({ message: "Failed to create review" });
    }
  });

  app.get('/api/mentors/:id/reviews', async (req, res) => {
    try {
      const reviews = await storage.getMentorReviews(req.params.id);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'ADMIN') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch('/api/admin/users/:id/role', isAuthenticated, async (req: any, res) => {
    try {
      const admin = await storage.getUser(req.user.claims.sub);
      if (admin?.role !== 'ADMIN') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { role } = req.body;
      await storage.updateUserRole(req.params.id, role);
      
      await storage.createAuditLog({
        actorId: req.user.claims.sub,
        action: 'UPDATE_ROLE',
        entity: 'user',
        entityId: req.params.id,
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(400).json({ message: "Failed to update user role" });
    }
  });

  app.post('/api/admin/mentors/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const admin = await storage.getUser(req.user.claims.sub);
      if (admin?.role !== 'ADMIN') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.approveMentor(req.params.id);
      
      await storage.createAuditLog({
        actorId: req.user.claims.sub,
        action: 'APPROVE_MENTOR',
        entity: 'user',
        entityId: req.params.id,
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error approving mentor:", error);
      res.status(400).json({ message: "Failed to approve mentor" });
    }
  });

  app.get('/api/admin/audit-logs', isAuthenticated, async (req: any, res) => {
    try {
      const admin = await storage.getUser(req.user.claims.sub);
      if (admin?.role !== 'ADMIN') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const logs = await storage.getAuditLogs();
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
