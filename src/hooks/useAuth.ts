import { useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface UserProfile {
  id: string
  name: string
  email: string
  role: 'admin' | 'mentor' | 'junior'
  profile_pic: string | null
  age: number | null
  college: string | null
  stream: string | null
  available_for_mentorship: boolean | null
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error)
        return null
      }

      return profile
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  useEffect(() => {
    let isMounted = true

    // Check initial session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session check error:', error)
          if (isMounted) {
            setSession(null)
            setUser(null)
            setUserProfile(null)
            setLoading(false)
          }
          return
        }
        
        if (isMounted) {
          if (session?.user) {
            console.log('Found existing session:', session.user.email)
            setSession(session)
            setUser(session.user)
            
            // Fetch user profile with role
            const profile = await fetchUserProfile(session.user.id)
            if (profile) {
              setUserProfile(profile)
            }
          } else {
            console.log('No existing session')
            setSession(null)
            setUser(null)
            setUserProfile(null)
          }
          setLoading(false)
        }
      } catch (error) {
        console.error('Session check error:', error)
        if (isMounted) {
          setSession(null)
          setUser(null)
          setUserProfile(null)
          setLoading(false)
        }
      }
    }

    checkSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.email)
        
        if (isMounted) {
          if (event === 'SIGNED_OUT') {
            setSession(null)
            setUser(null)
            setUserProfile(null)
          } else if (session?.user) {
            setSession(session)
            setUser(session.user)
            
            // Fetch user profile with role
            const profile = await fetchUserProfile(session.user.id)
            if (profile) {
              setUserProfile(profile)
            }
          } else {
            setSession(null)
            setUser(null)
            setUserProfile(null)
          }
          setLoading(false)
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  return { 
    user, 
    userProfile,
    loading, 
    session,
    isAuthenticated: !!user && !!session
  }
}

