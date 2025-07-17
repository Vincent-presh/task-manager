-- Create optimized analytics RPC function for better performance
-- This replaces N+1 queries with efficient SQL aggregation

CREATE OR REPLACE FUNCTION get_task_analytics(
  p_user_id UUID,
  p_now TIMESTAMP WITH TIME ZONE,
  p_next_week TIMESTAMP WITH TIME ZONE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  total_tasks INTEGER := 0;
  completed_tasks INTEGER := 0;
  pending_tasks INTEGER := 0;
  in_progress_tasks INTEGER := 0;
  overdue_tasks INTEGER := 0;
  completion_rate NUMERIC := 0;
  productivity_score INTEGER := 0;
  priority_counts JSON;
  tag_counts JSON;
  monthly_trends JSON;
  upcoming_deadlines JSON;
BEGIN
  -- Get basic task counts
  SELECT 
    COUNT(*) FILTER (WHERE TRUE),
    COUNT(*) FILTER (WHERE status = 'done'),
    COUNT(*) FILTER (WHERE status = 'pending'),
    COUNT(*) FILTER (WHERE status = 'in-progress'),
    COUNT(*) FILTER (WHERE status != 'done' AND (extras->>'due_date')::timestamp < p_now)
  INTO total_tasks, completed_tasks, pending_tasks, in_progress_tasks, overdue_tasks
  FROM tasks 
  WHERE user_id = p_user_id;

  -- Calculate completion rate
  IF total_tasks > 0 THEN
    completion_rate := (completed_tasks::NUMERIC / total_tasks) * 100;
  END IF;

  -- Calculate productivity score
  productivity_score := ROUND(
    CASE 
      WHEN total_tasks = 0 THEN 0
      ELSE 
        (completion_rate * 0.4) +
        (GREATEST(0, 100 - (overdue_tasks::NUMERIC / total_tasks * 100)) * 0.3) +
        (LEAST(100, total_tasks * 10) * 0.2) +
        (LEAST(100, in_progress_tasks * 25) * 0.1)
    END
  );

  -- Get priority distribution
  SELECT json_object_agg(
    COALESCE(extras->>'priority', 'medium'), 
    priority_count
  ) INTO priority_counts
  FROM (
    SELECT 
      COALESCE(extras->>'priority', 'medium') as priority,
      COUNT(*) as priority_count
    FROM tasks 
    WHERE user_id = p_user_id
    GROUP BY COALESCE(extras->>'priority', 'medium')
  ) pc;

  -- Get tag distribution (limit to top 20 tags)
  SELECT json_object_agg(tag, tag_count) INTO tag_counts
  FROM (
    SELECT 
      jsonb_array_elements_text(extras->'tags') as tag,
      COUNT(*) as tag_count
    FROM tasks 
    WHERE user_id = p_user_id 
    AND extras->'tags' IS NOT NULL
    GROUP BY jsonb_array_elements_text(extras->'tags')
    ORDER BY COUNT(*) DESC
    LIMIT 20
  ) tc;

  -- Get monthly trends (last 6 months)
  SELECT json_agg(
    json_build_object(
      'month', month_year,
      'created', created_count,
      'completed', completed_count
    ) ORDER BY month_year
  ) INTO monthly_trends
  FROM (
    SELECT 
      to_char(inserted_at, 'YYYY-MM') as month_year,
      COUNT(*) as created_count,
      COUNT(*) FILTER (WHERE status = 'done') as completed_count
    FROM tasks 
    WHERE user_id = p_user_id 
    AND inserted_at >= (CURRENT_DATE - INTERVAL '6 months')
    GROUP BY to_char(inserted_at, 'YYYY-MM')
    ORDER BY month_year
  ) mt;

  -- Get upcoming deadlines
  SELECT json_agg(
    json_build_object(
      'taskId', id,
      'title', title,
      'dueDate', extras->>'due_date',
      'priority', COALESCE(extras->>'priority', 'medium')
    ) ORDER BY (extras->>'due_date')::timestamp
  ) INTO upcoming_deadlines
  FROM (
    SELECT id, title, extras
    FROM tasks 
    WHERE user_id = p_user_id
    AND status != 'done'
    AND extras->>'due_date' IS NOT NULL
    AND (extras->>'due_date')::timestamp >= p_now
    AND (extras->>'due_date')::timestamp <= p_next_week
    ORDER BY (extras->>'due_date')::timestamp
    LIMIT 10
  ) ud;

  -- Build final result
  result := json_build_object(
    'totalTasks', total_tasks,
    'completedTasks', completed_tasks,
    'pendingTasks', pending_tasks,
    'inProgressTasks', in_progress_tasks,
    'completionRate', completion_rate,
    'averageCompletionTime', 24, -- Simplified for demo
    'overdueTasks', overdue_tasks,
    'tasksByPriority', COALESCE(priority_counts, '{}'::json),
    'tasksByTag', COALESCE(tag_counts, '{}'::json),
    'productivityScore', productivity_score,
    'monthlyTrends', COALESCE(monthly_trends, '[]'::json),
    'upcomingDeadlines', COALESCE(upcoming_deadlines, '[]'::json)
  );

  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_task_analytics(UUID, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE) TO authenticated;