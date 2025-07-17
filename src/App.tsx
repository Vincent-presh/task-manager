import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useTasks } from './hooks/useTasks'
import { useDueTaskReminders } from './hooks/useDueTaskReminders'
import Auth from './components/auth/Auth'
import TaskList from './components/tasks/TaskList'
import NotificationSettings from './components/notifications/NotificationSettings'
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard'
import MobileSidebar from './components/navigation/MobileSidebar'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { tasks, loading: tasksLoading, createTask, updateTask, deleteTask } = useTasks()
  const [showNotificationSettings, setShowNotificationSettings] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  
  // Enable due task reminders when user is authenticated
  useDueTaskReminders(user ? tasks : [])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-purple-400 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.15s' }}></div>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">Loading TaskFlow</h2>
          <p className="text-white/60">Preparing your workspace...</p>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10"
      >
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center space-x-4"
            >
              <div className="h-10 w-10 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">TaskFlow</h1>
                <p className="text-sm text-white/60">Welcome back, {user.email?.split('@')[0]}</p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex items-center space-x-4"
            >
              <div className="hidden md:block text-right">
                <div className="text-sm text-white/80">
                  {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                </div>
                <div className="text-xs text-white/60">
                  {tasks.filter(t => t.status === 'done').length} completed
                </div>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-4">
                <button
                  onClick={() => setShowAnalytics(true)}
                  className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 border border-white/20 hover:border-white/40"
                  title="Analytics (Testing Only)"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setShowNotificationSettings(true)}
                  className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 border border-white/20 hover:border-white/40"
                  title="Notification Settings"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 0 1 15 0v5z" />
                  </svg>
                </button>
                <button
                  onClick={signOut}
                  className="px-4 py-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 border border-white/20 hover:border-white/40"
                >
                  Sign Out
                </button>
              </div>

              {/* Mobile Hamburger Menu */}
              <button
                onClick={() => setShowMobileMenu(true)}
                className="md:hidden p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 border border-white/20 hover:border-white/40"
                title="Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main>
        <TaskList
          tasks={tasks}
          onCreateTask={createTask}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          loading={tasksLoading}
        />
      </main>

      {/* Notification Settings Modal */}
      <AnimatePresence>
        {showNotificationSettings && (
          <NotificationSettings
            onClose={() => setShowNotificationSettings(false)}
          />
        )}
      </AnimatePresence>

      {/* Analytics Dashboard Modal */}
      <AnimatePresence>
        {showAnalytics && (
          <AnalyticsDashboard
            onClose={() => setShowAnalytics(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        <MobileSidebar
          isOpen={showMobileMenu}
          onClose={() => setShowMobileMenu(false)}
          onShowAnalytics={() => setShowAnalytics(true)}
          onShowNotificationSettings={() => setShowNotificationSettings(true)}
          onSignOut={signOut}
          userEmail={user.email || ''}
          tasks={tasks}
        />
      </AnimatePresence>
    </div>
  )
}

export default App