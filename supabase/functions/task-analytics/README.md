# Task Analytics Edge Function

This Supabase Edge Function provides advanced analytics for a user's tasks. It is designed to be deployed to Supabase and called from your frontend or backend to retrieve insights about task statuses, productivity, and trends.

## What does it do?

- Authenticates the user via Supabase Auth.
- Fetches all tasks for the authenticated user from the `tasks` table.
- Calculates and returns analytics including:
  - Total, completed, pending, and in-progress tasks
  - Completion rate
  - Overdue tasks
  - Tasks by priority and tag
  - Average completion time (demo logic)
  - Productivity score
  - Monthly trends (created/completed)
  - Upcoming deadlines (next 7 days)

## Example Output

```json
{
  "totalTasks": 12,
  "completedTasks": 5,
  "pendingTasks": 4,
  "inProgressTasks": 3,
  "completionRate": 41.7,
  "averageCompletionTime": 24,
  "overdueTasks": 1,
  "tasksByPriority": {"high": 2, "medium": 7, "low": 3},
  "tasksByTag": {"work": 4, "urgent": 2},
  "productivityScore": 78,
  "monthlyTrends": [{"month": "2024-03", "completed": 2, "created": 3}],
  "upcomingDeadlines": [
    {
      "taskId": "abc",
      "title": "Finish report",
      "dueDate": "2024-07-20",
      "priority": "high"
    }
  ]
}
```

## Environment Variables

Set these in your Supabase project or local `.env`:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anon/public key

## Deployment

1. **Install the Supabase CLI** (see https://github.com/supabase/cli#install-the-cli)
2. **Set environment variables**:
   ```bash
   supabase functions secrets set SUPABASE_URL=your-url SUPABASE_ANON_KEY=your-key
   ```
3. **Deploy the function**:
   ```bash
   supabase functions deploy task-analytics
   ```
4. **Call the function** from your app:
   ```js
   fetch("https://<project-ref>.functions.supabase.co/task-analytics", {
     headers: {Authorization: `Bearer <jwt>`},
   });
   ```

## Notes

- This function is written for Deno and Supabase Edge Functions.
- Do not import or run this code in Node.js or your frontend.
- For more info, see the [Supabase Edge Functions docs](https://supabase.com/docs/guides/functions).
