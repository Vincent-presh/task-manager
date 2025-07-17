# User Task Manager App

A full-stack user task manager built with React, Supabase, and Edge Functions. Users can manage their tasks and run an Edge Function to get insights about their current task statuses.

## Features

- **Authentication**: Sign up and login with Supabase Auth. Only show tasks for the logged-in user.
- **CRUD for Tasks**: Create, edit, and delete tasks.
- **Task Model**:
  - `title`: text (required)
  - `description`: text
  - `status`: pending, in-progress, or done
  - `extras`: JSONB (e.g., tags, due date, priority)
- **Bonus**:
  - Tailwind CSS or clean CSS
  - Filtering by task status
  - (Optional) Deploy to Vercel
  - Input validation (e.g., empty title)

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd <repo-directory>
   ```
2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Set up Supabase**
   - Go to [Supabase](https://supabase.com/) and create a new project.
   - Get your Supabase URL and anon/public key.
   - Create the `tasks` table using the schema below.
   - Enable authentication (email/password).
4. **Configure environment variables**
   - Create a `.env.local` file in the root:
     ```env
     VITE_SUPABASE_URL=your-supabase-url
     VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
     ```
   - **Security Note**: The application validates these environment variables on startup. Missing or invalid configuration will be logged to the console.
5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Supabase Schema

```sql
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  status text check (status in ('pending', 'in-progress', 'done')) not null default 'pending',
  extras jsonb,
  inserted_at timestamp with time zone default timezone('utc'::text, now())
);
```

- **Security**: Enable Row Level Security (RLS) and add policies so users can only access their own tasks.
- **Additional Tables**: The app also uses `task_comments` and `task_attachments` tables for full functionality.

## Advanced Features (Implemented)

### ✅ **Completed Features:**
- **Notifications/Reminders**: Browser notifications for due and overdue tasks
- **Task Comments**: Full commenting system with real-time updates
- **Task Attachments**: File upload/download with Supabase Storage
- **Mobile-Friendly UI**: Responsive design with hamburger menu and sliding sidebar
- **Advanced Analytics**: Edge Function with comprehensive productivity metrics
- **Security & Performance**: Comprehensive security hardening and optimization

### 📊 **Analytics Edge Function**
The analytics system includes an Edge Function that calculates:
- Task completion rates and productivity scores
- Priority distribution and trend analysis
- Upcoming deadlines and overdue task tracking
- Monthly productivity trends

**Note**: In this demo, the analytics are manually triggered for testing purposes. In production, this would be automatically triggered by:
- Supabase database triggers on task updates
- Scheduled functions (cron jobs)
- Real-time subscriptions to database changes

### 📱 **Mobile Navigation**
- Hamburger menu appears on mobile devices
- Sliding sidebar with user stats and navigation
- Touch-optimized interface with responsive layouts

### 🔒 **Security & Performance Features**
- **Input Sanitization**: XSS protection with DOMPurify and validation
- **File Upload Security**: MIME type validation, dangerous file blocking, size limits
- **Rate Limiting**: Protection against API abuse and brute force attacks
- **Error Boundaries**: Graceful error handling preventing app crashes
- **Content Security Policy**: Script injection prevention
- **SQL Injection Protection**: Parameterized queries and input validation
- **Session Management**: Auto-refresh tokens, expiry tracking
- **Environment Validation**: Startup checks for required configuration
- **Database Performance**: Optimized indexes for JSONB fields and common queries
- **Virtual Scrolling**: Efficient rendering of large task lists
- **Query Caching**: Client-side caching with TTL for improved performance
- **SQL Optimization**: Analytics use database aggregation instead of client processing

## Security Implementation Details

### 🛡️ **Comprehensive Security Measures**

This application implements enterprise-grade security features:

#### **Input Validation & Sanitization**
- XSS protection using DOMPurify for HTML content
- Input validation for task titles, descriptions, and tags
- Filename sanitization for uploaded files
- UUID validation for all database operations

#### **File Upload Security**
- MIME type validation and allowlist enforcement
- Dangerous file extension blocking (executables, scripts)
- File size limits (10MB maximum)
- Secure file handling with sanitized names

#### **Rate Limiting**
- Authentication operations: 5 requests per minute
- Edge function analytics: 10 requests per minute
- Client-side rate limiting for user actions

#### **Error Handling**
- React Error Boundaries prevent application crashes
- Sanitized error logging (no sensitive data exposure)
- Graceful fallbacks for failed operations

#### **Session Security**
- Automatic token refresh 5 minutes before expiry
- Session expiry tracking and warnings
- Secure sign-out with cleanup

#### **Content Security Policy**
- Script injection prevention in production
- Restricted resource loading policies
- CSP headers dynamically generated

#### **Environment & Infrastructure**
- Environment variable validation on startup
- Secure database policies with Row Level Security
- Parameterized queries to prevent SQL injection

#### **Performance Optimizations**
- **Database Indexes**: Strategic indexes on JSONB fields (due_date, priority, tags)
- **N+1 Query Prevention**: Analytics use SQL aggregation instead of client processing
- **Virtual Scrolling**: React-window for efficient large list rendering
- **Client-side Caching**: TTL-based caching for tasks and analytics
- **Pagination**: Efficient data loading with infinite scroll capability
- **Memory Management**: Cache cleanup and size limits to prevent memory leaks

## Dev Note: What I'd Build Next

- Real-time collaboration features
- Task assignment and team management
- Integration with calendar applications
- Advanced reporting and data export
- Two-factor authentication
- Audit logging for compliance

## (Optional) Deployment

- Deploy the app to [Vercel](https://vercel.com/) for a public link.

## Animations with Framer Motion

To add beautiful and performant animations to your app, use [Framer Motion](https://www.framer.com/motion/), a popular React animation library.

### Installation

In your `frontend` directory, run:

```bash
npm install framer-motion
# or
yarn add framer-motion
```

### Basic Usage Example

```tsx
import {motion} from "framer-motion";

function MyComponent() {
  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
      transition={{duration: 0.5}}
    >
      Animated content here
    </motion.div>
  );
}
```

- Wrap elements with `motion` components to animate them.
- Use `initial`, `animate`, and `exit` props to control animation states.
- See the [Framer Motion documentation](https://www.framer.com/motion/) for advanced usage and examples.

---

Feel free to open issues or contribute!
@README.md Create a plan from this readm and start the implementation
