import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { analyticsCache, createCacheKey, withCache } from '../utils/cache';

interface AnalyticsData {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  overdueTasks: number;
  tasksByPriority: {
    high: number;
    medium: number;
    low: number;
  };
  tasksByTag: Record<string, number>;
  productivityScore: number;
  monthlyTrends: Array<{
    month: string;
    completed: number;
    created: number;
  }>;
  upcomingDeadlines: Array<{
    taskId: string;
    title: string;
    dueDate: string;
    priority: string;
  }>;
}

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const cacheKey = createCacheKey('analytics', user.id);
      
      // Use cached data unless force refresh is requested
      if (!forceRefresh) {
        const cached = analyticsCache.get(cacheKey);
        if (cached) {
          setAnalytics(cached);
          setLoading(false);
          return cached;
        }
      }

      // Fetch fresh data
      const analyticsData = await withCache(
        cacheKey,
        async () => {
          const { data, error } = await supabase.functions.invoke('task-analytics', {
            headers: {
              Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            },
          });

          if (error) throw error;
          return data as AnalyticsData;
        },
        analyticsCache,
        5 * 60 * 1000 // 5 minutes TTL for analytics
      );

      setAnalytics(analyticsData);
      return analyticsData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const invalidateCache = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const cacheKey = createCacheKey('analytics', user.id);
      analyticsCache.delete(cacheKey);
    }
  }, []);

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
    invalidateCache,
  };
}