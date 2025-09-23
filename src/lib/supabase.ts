import { createClient } from '@supabase/supabase-js'
import { config } from './config'

export const supabase = createClient(config.supabase.url, config.supabase.anonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: 'admin' | 'mentor' | 'junior'
          profile_pic: string | null
          age: number | null
          college: string | null
          stream: string | null
          available_for_mentorship: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role: 'admin' | 'mentor' | 'junior'
          profile_pic?: string | null
          age?: number | null
          college?: string | null
          stream?: string | null
          available_for_mentorship?: boolean | null
        }
        Update: {
          name?: string
          email?: string
          profile_pic?: string | null
          age?: number | null
          college?: string | null
          stream?: string | null
          available_for_mentorship?: boolean | null
        }
      }
      communities: {
        Row: {
          id: string
          name: string
          description: string | null
          college_name: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          college_name: string
          created_by?: string | null
        }
        Update: {
          name?: string
          description?: string | null
          college_name?: string
        }
      }
      community_memberships: {
        Row: {
          id: string
          user_id: string
          community_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          user_id: string
          community_id: string
        }
        Update: {
          user_id?: string
          community_id?: string
        }
      }
      clubs: {
        Row: {
          id: string
          name: string
          description: string | null
          community_id: string
          club_head: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          community_id: string
          club_head?: string | null
          created_by?: string | null
        }
        Update: {
          name?: string
          description?: string | null
          club_head?: string | null
        }
      }
      club_memberships: {
        Row: {
          id: string
          user_id: string
          club_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          user_id: string
          club_id: string
        }
        Update: {
          user_id?: string
          club_id?: string
        }
      }
      club_posts: {
        Row: {
          id: string
          content: string
          author_id: string
          club_id: string
          is_approved: boolean
          flagged: boolean
          moderation_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content: string
          author_id: string
          club_id: string
          is_approved?: boolean
          flagged?: boolean
          moderation_reason?: string | null
        }
        Update: {
          content?: string
          is_approved?: boolean
          flagged?: boolean
          moderation_reason?: string | null
        }
      }
      mentors: {
        Row: {
          id: string
          user_id: string
          expertise: string[] | null
          experience_years: number | null
          bio: string | null
          rating: number
          total_mentees: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          expertise?: string[] | null
          experience_years?: number | null
          bio?: string | null
          rating?: number
          total_mentees?: number
        }
        Update: {
          expertise?: string[] | null
          experience_years?: number | null
          bio?: string | null
          rating?: number
          total_mentees?: number
        }
      }
      mentorships: {
        Row: {
          id: string
          mentor_id: string
          mentee_id: string
          status: 'pending' | 'accepted' | 'rejected' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          mentor_id: string
          mentee_id: string
          status?: 'pending' | 'accepted' | 'rejected' | 'completed'
        }
        Update: {
          status?: 'pending' | 'accepted' | 'rejected' | 'completed'
        }
      }
      chat_rooms: {
        Row: {
          id: string
          name: string
          mentorship_id: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          mentorship_id?: string | null
          created_by?: string | null
        }
        Update: {
          name?: string
        }
      }
      messages: {
        Row: {
          id: string
          content: string
          sender_id: string
          room_id: string
          message_type: 'text' | 'image' | 'file'
          created_at: string
        }
        Insert: {
          id?: string
          content: string
          sender_id: string
          room_id: string
          message_type?: 'text' | 'image' | 'file'
        }
        Update: {
          content?: string
        }
      }
      room_memberships: {
        Row: {
          id: string
          user_id: string
          room_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          user_id: string
          room_id: string
        }
        Update: {
          user_id?: string
          room_id?: string
        }
      }
      moderation_logs: {
        Row: {
          id: string
          content_type: 'post' | 'message'
          content_id: string
          flagged_reason: string | null
          moderator_action: 'approved' | 'deleted' | 'pending' | null
          gemini_response: any | null
          created_at: string
        }
        Insert: {
          id?: string
          content_type: 'post' | 'message'
          content_id: string
          flagged_reason?: string | null
          moderator_action?: 'approved' | 'deleted' | 'pending' | null
          gemini_response?: any | null
        }
        Update: {
          flagged_reason?: string | null
          moderator_action?: 'approved' | 'deleted' | 'pending' | null
          gemini_response?: any | null
        }
      }
    }
  }
}

// Auth helper functions
export const authHelpers = {
  async signInWithPassword(email: string, password: string, adminCode?: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    if (data.user) {
      // Check if admin code is provided and correct
      const isAdmin = adminCode === config.admin.code
      const role = isAdmin ? 'admin' : 'junior'

      // Update user metadata with role if admin
      if (isAdmin) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { role: 'admin' }
        })

        if (updateError) {
          console.error('Error updating user role:', updateError)
        }
      }

      // Get or create user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError && profileError.code === 'PGRST116') {
        // User profile doesn't exist, create it
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
            email: data.user.email || '',
            role: role as 'admin' | 'mentor' | 'junior',
            profile_pic: data.user.user_metadata?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
            age: 18,
            college: '',
            stream: '',
            available_for_mentorship: false
          })

        if (insertError) {
          console.error('Error creating user profile:', insertError)
        }
      } else if (profileError) {
        console.error('Error fetching user profile:', profileError)
      }

      return {
        user: data.user,
        role: profile?.role || role,
        profile: profile || null
      }
    }

    return null
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  async getCurrentSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }
}