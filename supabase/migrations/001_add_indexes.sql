-- Add indexes for performance optimization on JSONB fields
-- These indexes will improve query performance for filtering and sorting by due_date, priority, and tags

-- Index for due_date queries (used for overdue tasks, upcoming deadlines)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_due_date 
ON tasks USING BTREE ((extras->>'due_date'));

-- Index for priority filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_priority 
ON tasks USING BTREE ((extras->>'priority'));

-- GIN index for tags array operations (contains, overlaps)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_tags 
ON tasks USING GIN ((extras->'tags'));

-- Composite index for user_id + status (most common query pattern)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_user_status 
ON tasks (user_id, status);

-- Composite index for user_id + inserted_at (for pagination and recent tasks)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_user_created 
ON tasks (user_id, inserted_at DESC);

-- Index for user_id + status + due_date (for overdue task queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_user_status_due 
ON tasks (user_id, status, (extras->>'due_date'));

-- Partial index for non-completed tasks with due dates
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_active_with_due_date 
ON tasks (user_id, (extras->>'due_date')) 
WHERE status != 'done' AND extras->>'due_date' IS NOT NULL;