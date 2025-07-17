import { useState, useEffect, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { RateLimiter } from '../utils/security'

// Rate limiter for auth operations
const authRateLimiter = new RateLimiter(5, 60000) // 5 requests per minute

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null)
  const refreshTimer = useRef<NodeJS.Timeout | null>(null)

  // Auto-refresh token before expiry
  useEffect(() => {
    if (sessionExpiry && user) {
      const now = new Date()
      const timeUntilExpiry = sessionExpiry.getTime() - now.getTime()
      const refreshTime = timeUntilExpiry - 5 * 60 * 1000 // 5 minutes before expiry
      
      if (refreshTime > 0) {
        refreshTimer.current = setTimeout(async () => {
          try {
            const { data, error } = await supabase.auth.refreshSession()
            if (error) {
              console.error('Session refresh failed:', error)
              await signOut()
            } else if (data.session) {
              setSessionExpiry(new Date(data.session.expires_at! * 1000))
            }
          } catch (err) {
            console.error('Session refresh error:', err)
            await signOut()
          }
        }, refreshTime)
      }
    }

    return () => {
      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current)
      }
    }
  }, [sessionExpiry, user])

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          setUser(null)
        } else if (session) {
          setUser(session.user)
          setSessionExpiry(new Date(session.expires_at! * 1000))
        } else {
          setUser(null)
          setSessionExpiry(null)
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (event === 'SIGNED_IN' && session) {
            setUser(session.user)
            setSessionExpiry(new Date(session.expires_at! * 1000))
          } else if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
            if (session) {
              setUser(session.user)
              setSessionExpiry(new Date(session.expires_at! * 1000))
            } else {
              setUser(null)
              setSessionExpiry(null)
            }
          } else if (event === 'USER_UPDATED' && session) {
            setUser(session.user)
          }
        } catch (err) {
          console.error('Auth state change error:', err)
          setUser(null)
          setSessionExpiry(null)
        } finally {
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    try {
      // Rate limit sign-out attempts
      const clientId = 'signout'
      if (!authRateLimiter.isAllowed(clientId)) {
        console.warn('Sign out rate limited')
        return
      }

      // Clear refresh timer
      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current)
        refreshTimer.current = null
      }

      await supabase.auth.signOut()
      setUser(null)
      setSessionExpiry(null)
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  // Check if session is expired or about to expire
  const isSessionExpired = () => {
    if (!sessionExpiry) return false
    const now = new Date()
    return sessionExpiry.getTime() <= now.getTime()
  }

  const isSessionExpiringSoon = () => {
    if (!sessionExpiry) return false
    const now = new Date()
    const timeUntilExpiry = sessionExpiry.getTime() - now.getTime()
    return timeUntilExpiry <= 10 * 60 * 1000 // 10 minutes
  }

  return {
    user,
    loading,
    signOut,
    sessionExpiry,
    isSessionExpired,
    isSessionExpiringSoon,
  }
}