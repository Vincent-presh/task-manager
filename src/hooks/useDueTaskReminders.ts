import { useEffect, useRef } from 'react'
import type { Task } from '../types/task'
import { useNotifications } from './useNotifications'

export function useDueTaskReminders(tasks: Task[]) {
  const { showTaskReminder, permission } = useNotifications()
  const checkedTasks = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (permission !== 'granted') return

    const checkDueTasks = () => {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      tasks.forEach(task => {
        if (task.status === 'done' || !task.extras?.due_date) return
        
        const dueDate = new Date(task.extras.due_date)
        const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())
        
        // Check if task is due today and hasn't been notified yet
        if (dueDateOnly.getTime() === today.getTime() && !checkedTasks.current.has(task.id)) {
          showTaskReminder(task.title, task.extras.due_date)
          checkedTasks.current.add(task.id)
        }
        
        // Check if task is overdue
        if (dueDateOnly.getTime() < today.getTime() && !checkedTasks.current.has(`overdue-${task.id}`)) {
          showTaskReminder(`⚠️ Overdue: ${task.title}`, task.extras.due_date)
          checkedTasks.current.add(`overdue-${task.id}`)
        }
      })
    }

    // Check immediately
    checkDueTasks()

    // Set up interval to check every hour
    const interval = setInterval(checkDueTasks, 60 * 60 * 1000)

    return () => {
      clearInterval(interval)
    }
  }, [tasks, permission, showTaskReminder])

  // Reset checked tasks when tasks change (e.g., task completed)
  useEffect(() => {
    const completedTasks = tasks.filter(task => task.status === 'done')
    completedTasks.forEach(task => {
      checkedTasks.current.delete(task.id)
      checkedTasks.current.delete(`overdue-${task.id}`)
    })
  }, [tasks])
}