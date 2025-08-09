# Overview

Afrorise is a nonprofit web application that connects mentors with young professionals and supports career development. The platform facilitates mentorship relationships through session booking, collaborative project work, and professional development opportunities. Built as a full-stack web application, it serves three primary user roles: mentees seeking guidance, mentors offering expertise, and administrators managing the platform.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**React with TypeScript**: The client-side application uses React 18 with TypeScript for type safety and better developer experience. The application uses Vite as the build tool and development server.

**Routing**: Implemented with Wouter for lightweight client-side routing, supporting authenticated and public routes based on user authentication state.

**UI Framework**: Built with shadcn/ui components based on Radix UI primitives, providing accessible and customizable components. Tailwind CSS handles styling with a custom design system including primary/secondary color schemes and dark mode support.

**State Management**: TanStack Query (React Query) manages server state, caching, and data synchronization. Local component state is handled with React hooks.

**Form Handling**: React Hook Form with Zod validation schemas ensure type-safe form validation and submission.

## Backend Architecture

**Express.js Server**: RESTful API built with Express.js and TypeScript, providing endpoints for user management, mentoring sessions, projects, messaging, and administrative functions.

**Authentication**: Replit-based OIDC authentication with session management using express-session and PostgreSQL session storage. Role-based access control (RBAC) with three user roles: ADMIN, MENTOR, and MENTEE.

**API Design**: RESTful endpoints organized by feature domains (profiles, sessions, projects, gigs, messages, reviews) with consistent error handling and request/response patterns.

## Data Storage Solutions

**Database**: PostgreSQL database with Drizzle ORM for type-safe database operations and migrations. Uses Neon serverless PostgreSQL for cloud deployment.

**Schema Design**: Normalized relational schema supporting users, profiles, mentoring sessions, collaborative projects, gig marketplace, messaging system, and audit logging.

**Connection Management**: Uses connection pooling with @neondatabase/serverless for efficient database connections in serverless environments.

## Core Data Models

- **Users & Profiles**: Separate user authentication data from profile information, supporting role-based features
- **Sessions**: Mentoring sessions with booking, scheduling, and status tracking
- **Projects**: Collaborative workspaces with Kanban-style task management
- **Gigs**: Freelance opportunity marketplace with application system
- **Messaging**: Thread-based messaging system for communication
- **Reviews**: Rating and feedback system for mentors

# External Dependencies

## Database Services
- **Neon**: Serverless PostgreSQL database hosting
- **Drizzle ORM**: Type-safe database schema definition and query building
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## Authentication & Security
- **Replit OIDC**: Authentication provider integration
- **openid-client**: OIDC client implementation
- **Passport**: Authentication middleware for Express

## Frontend Libraries
- **Radix UI**: Headless UI component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type validation and schema definition

## Development Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Static type checking across full stack
- **ESBuild**: JavaScript bundling for production builds

## Planned Integrations
- **Email Service**: Resend or Nodemailer for transactional emails
- **File Storage**: Future integration for resume/document uploads
- **Calendar Integration**: Cal.com or similar for scheduling integration
- **Payment Processing**: Stripe for donations and premium features