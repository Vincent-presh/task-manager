import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface TaskAnalytics {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  inProgressTasks: number
  completionRate: number
  averageCompletionTime: number
  overdueTasks: number
  tasksByPriority: {
    high: number
    medium: number
    low: number
  }
  tasksByTag: Record<string, number>
  productivityScore: number
  monthlyTrends: Array<{
    month: string
    completed: number
    created: number
  }>
  upcomingDeadlines: Array<{
    taskId: string
    title: string
    dueDate: string
    priority: string
  }>
}

export function useTaskAnalytics() {
  const [analytics, setAnalytics] = useState<TaskAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.functions.invoke('task-analytics', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      })

      if (error) throw error
      setAnalytics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics
  }
}