import { useState, useEffect } from 'react'

interface NotificationState {
  permission: NotificationPermission | null
  supported: boolean
}

export function useNotifications() {
  const [notificationState, setNotificationState] = useState<NotificationState>({
    permission: null,
    supported: false
  })

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationState({
        permission: Notification.permission,
        supported: true
      })
    }
  }, [])

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      return 'denied'
    }

    const permission = await Notification.requestPermission()
    setNotificationState(prev => ({ ...prev, permission }))
    return permission
  }

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (!notificationState.supported || notificationState.permission !== 'granted') {
      return
    }

    const notification = new Notification(title, {
      icon: '/vite.svg',
      badge: '/vite.svg',
      ...options
    })

    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000)

    return notification
  }

  const showTaskReminder = (taskTitle: string, dueDate: string) => {
    showNotification(`Task Reminder: ${taskTitle}`, {
      body: `Due: ${new Date(dueDate).toLocaleDateString()}`,
      tag: 'task-reminder',
      requireInteraction: true
    })
  }

  return {
    ...notificationState,
    requestPermission,
    showNotification,
    showTaskReminder
  }
}