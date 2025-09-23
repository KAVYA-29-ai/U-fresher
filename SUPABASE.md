# 🚀 U-fresher ❤ - Supabase Integration Guide

This guide will help you connect your U-fresher platform to a real Supabase backend, replacing the mock data with a production-ready database and authentication system.

## 📋 Prerequisites

- A Supabase account ([sign up here](https://supabase.com))
- A Google Cloud Console account for OAuth
- A Gemini AI API key for content moderation
- Vercel account for deployment

## 🏗️ Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `u-fresher-app`
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users

## 🗄️ Step 2: Database Schema Setup

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'mentor', 'junior')),
  profile_pic TEXT,
  age INTEGER,
  college TEXT,
  stream TEXT,
  available_for_mentorship BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Communities table
CREATE TABLE public.communities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Clubs table
CREATE TABLE public.clubs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  club_head UUID REFERENCES public.users(id),
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Community memberships
CREATE TABLE public.community_memberships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, community_id)
);

-- Club memberships
CREATE TABLE public.club_memberships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, club_id)
);

-- Chat rooms
CREATE TABLE public.chat_rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CHECK ((community_id IS NOT NULL AND club_id IS NULL) OR (community_id IS NULL AND club_id IS NOT NULL))
);

-- Messages
CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content TEXT NOT NULL,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Mentorship connections
CREATE TABLE public.mentorships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mentor_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  mentee_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(mentor_id, mentee_id)
);

-- Room memberships (for tracking who's in which chat room)
CREATE TABLE public.room_memberships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, room_id)
);

-- Content moderation logs
CREATE TABLE public.moderation_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN ('message', 'post')),
  content_id UUID NOT NULL,
  flagged_reason TEXT,
  moderator_action TEXT CHECK (moderator_action IN ('approved', 'deleted', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

## 🔐 Step 3: Row Level Security (RLS) Policies

Enable RLS and create policies:

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Communities policies
CREATE POLICY "Everyone can view communities" ON public.communities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage communities" ON public.communities FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Community memberships policies
CREATE POLICY "Users can view community memberships" ON public.community_memberships FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own memberships" ON public.community_memberships FOR ALL TO authenticated USING (user_id = auth.uid());

-- Messages policies
CREATE POLICY "Room members can view messages" ON public.messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.room_memberships WHERE user_id = auth.uid() AND room_id = messages.room_id)
);
CREATE POLICY "Users can send messages to joined rooms" ON public.messages FOR INSERT TO authenticated WITH CHECK (
  sender_id = auth.uid() AND EXISTS (SELECT 1 FROM public.room_memberships WHERE user_id = auth.uid() AND room_id = messages.room_id)
);

-- Admin-only policies for moderation
CREATE POLICY "Admins can view moderation logs" ON public.moderation_logs FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
```

## 🔧 Step 4: Database Functions

Create useful functions:

```sql
-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, role, profile_pic, age, college, stream)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'junior'),
    COALESCE(new.raw_user_meta_data->>'profile_pic', 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'),
    COALESCE((new.raw_user_meta_data->>'age')::integer, 18),
    COALESCE(new.raw_user_meta_data->>'college', ''),
    COALESCE(new.raw_user_meta_data->>'stream', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = timezone('utc'::text, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.mentorships FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
```

## 🔑 Step 5: Authentication Setup

### Google OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
7. Copy Client ID and Client Secret

### Supabase Auth Configuration

1. In Supabase Dashboard → Authentication → Settings
2. Add Google OAuth provider:
   - **Client ID**: Your Google Client ID
   - **Client Secret**: Your Google Client Secret
3. Configure redirect URLs:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: 
     ```
     https://your-app.vercel.app/auth/callback
     http://localhost:5173/auth/callback
     ```

## ⚙️ Step 6: Environment Variables

### For Vercel Deployment

Add these environment variables in Vercel:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
ADMIN_CODE=Createrkkrishavya
GEMINI_API_KEY=your-gemini-api-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### For Local Development

Create `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
ADMIN_CODE=Createrkkrishavya
GEMINI_API_KEY=your-gemini-api-key
```

## 🤖 Step 7: Edge Functions for AI Moderation

Create Supabase Edge Function for content moderation:

```typescript
// supabase/functions/moderate-content/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.5.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { content } = await req.json()
    
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '')
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `
    Analyze this content for inappropriate material including:
    - Hate speech, harassment, or bullying
    - Explicit sexual content
    - Violence or threats
    - Spam or misleading information
    - Academic dishonesty
    
    Content: "${content}"
    
    Respond with JSON: {"flagged": boolean, "reason": "explanation if flagged"}
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Parse AI response
    const moderation = JSON.parse(text)

    return new Response(JSON.stringify(moderation), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
```

Deploy the function:
```bash
supabase functions deploy moderate-content
```

## 📱 Step 8: Update Frontend Code

Replace mock data imports with real Supabase client:

### Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### Create Supabase Client

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
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
          role: 'admin' | 'mentor' | 'junior'
          profile_pic?: string | null
          age?: number | null
          college?: string | null
          stream?: string | null
          available_for_mentorship?: boolean | null
        }
        Update: {
          name?: string
          profile_pic?: string | null
          age?: number | null
          college?: string | null
          stream?: string | null
          available_for_mentorship?: boolean | null
        }
      }
      // Add other table types...
    }
  }
}
```

### Authentication Hook

```typescript
// src/hooks/useAuth.ts
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
```

## 🚀 Step 9: Deployment

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy the application
4. Test all functionality

### Security Checklist

- ✅ RLS policies enabled and tested
- ✅ Environment variables secure
- ✅ OAuth URLs configured correctly
- ✅ Admin code is strong and unique
- ✅ API keys are not exposed in frontend
- ✅ Edge functions are properly secured

## 🔧 Step 10: Testing & Validation

### Test Admin Features
1. Login with admin code
2. Create communities and clubs
3. Access moderation panel
4. Review flagged content

### Test User Features
1. Register new users
2. Join communities
3. Send messages
4. Request mentorship

### Test Moderation
1. Send test messages with inappropriate content
2. Verify AI moderation flags content
3. Test admin approval/rejection

## 🎯 Production Considerations

### Performance
- Add database indexes for frequently queried fields
- Implement pagination for large datasets
- Use Supabase realtime subscriptions for chat

### Monitoring
- Set up Supabase monitoring and alerts
- Monitor API usage and rate limits
- Track user engagement metrics

### Backup & Recovery
- Configure automatic database backups
- Test restore procedures
- Implement point-in-time recovery

## 🆘 Troubleshooting

### Common Issues

**Authentication Errors**
- Check OAuth redirect URLs
- Verify environment variables
- Confirm RLS policies

**Database Connection Issues**
- Verify Supabase URL and keys
- Check network connectivity
- Review RLS policy permissions

**Edge Function Errors**
- Check function logs in Supabase dashboard
- Verify environment variables in functions
- Test function endpoints manually

### Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- [Vercel Documentation](https://vercel.com/docs)

---

## 🎉 Congratulations!

You've successfully connected U-fresher ❤ to a production-ready Supabase backend! Your platform now supports:

- ✅ Real user authentication with Google OAuth
- ✅ Secure database with Row Level Security
- ✅ AI-powered content moderation
- ✅ Real-time messaging capabilities
- ✅ Scalable cloud infrastructure

Your students can now enjoy a fully functional, secure, and scalable social platform for their college community! 🚀

Remember to rotate your admin code periodically and monitor your application for any security concerns. Happy coding! 💙