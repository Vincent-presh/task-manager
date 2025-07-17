import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import type { Task, CreateTaskData, UpdateTaskData } from '../types/task'
import { taskCache, createCacheKey, withCache, clearCacheByPattern } from '../utils/cache'

interface PaginationState {
  page: number
  pageSize: number
  totalCount: number
  hasMore: boolean
}

export function useTasks(enablePagination = false, initialPageSize = 50) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    pageSize: initialPageSize,
    totalCount: 0,
    hasMore: true
  })

  // Memoized task filtering and sorting
  const memoizedTasks = useMemo(() => {
    return tasks.sort((a, b) => 
      new Date(b.inserted_at).getTime() - new Date(a.inserted_at).getTime()
    )
  }, [tasks])

  const fetchTasks = async (page = 0, append = false) => {
    try {
      if (!append) {
        setLoading(true)
        setError(null)
      }
      
      // Create cache key for this specific query
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')
      
      const cacheKey = createCacheKey('tasks', user.id, page, pagination.pageSize, enablePagination)
      
      // Try to get from cache first (only for non-append requests)
      if (!append) {
        const cached = taskCache.get(cacheKey)
        if (cached) {
          setTasks(cached.tasks)
          if (enablePagination && cached.pagination) {
            setPagination(cached.pagination)
          }
          setLoading(false)
          return
        }
      }
      
      let query = supabase
        .from('tasks')
        .select('*', { count: 'exact' })
        .order('inserted_at', { ascending: false })

      if (enablePagination) {
        const start = page * pagination.pageSize
        const end = start + pagination.pageSize - 1
        query = query.range(start, end)
      }

      const { data, error, count } = await query

      if (error) throw error
      
      const newTasks = data || []
      
      if (append) {
        setTasks(prev => [...prev, ...newTasks])
      } else {
        setTasks(newTasks)
        
        // Cache the result (only for first page to avoid cache bloat)
        if (page === 0) {
          const cacheData = {
            tasks: newTasks,
            pagination: enablePagination ? {
              page,
              pageSize: pagination.pageSize,
              totalCount: count || 0,
              hasMore: newTasks.length === pagination.pageSize
            } : null
          }
          taskCache.set(cacheKey, cacheData, 2 * 60 * 1000) // 2 minutes TTL
        }
      }

      if (enablePagination) {
        setPagination(prev => ({
          ...prev,
          page,
          totalCount: count || 0,
          hasMore: newTasks.length === prev.pageSize
        }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const loadMore = async () => {
    if (!enablePagination || !pagination.hasMore || loading) return
    
    const nextPage = pagination.page + 1
    await fetchTasks(nextPage, true)
  }

  const createTask = async (taskData: CreateTaskData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...taskData, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setTasks(prev => [data, ...prev])
      
      // Invalidate task cache when creating new task
      clearCacheByPattern(`tasks:${user.id}`, taskCache)
      
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task')
      throw err
    }
  }

  const updateTask = async (id: string, updates: UpdateTaskData) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setTasks(prev => prev.map(task => task.id === id ? data : task))
      
      // Invalidate cache when updating task
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        clearCacheByPattern(`tasks:${user.id}`, taskCache)
      }
      
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task')
      throw err
    }
  }

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error
      setTasks(prev => prev.filter(task => task.id !== id))
      
      // Invalidate cache when deleting task
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        clearCacheByPattern(`tasks:${user.id}`, taskCache)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task')
      throw err
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  return {
    tasks: memoizedTasks,
    loading,
    error,
    pagination,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks,
    loadMore,
  }
}