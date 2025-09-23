# 🚀 U-Fresher Complete Database Schema

This document contains the complete database schema for the U-Fresher application.

## 📋 Database Tables

### 1. Users Table
```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'mentor', 'junior')),
  profile_pic TEXT,
  age INTEGER,
  college TEXT,
  stream TEXT,
  available_for_mentorship BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 2. Communities Table
```sql
-- Communities table (one college per user)
CREATE TABLE public.communities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  college_name TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 3. Community Memberships
```sql
-- Community memberships (one per user)
CREATE TABLE public.community_memberships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, community_id)
);
```

### 4. Clubs Table
```sql
-- Clubs table (multiple per user)
CREATE TABLE public.clubs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  club_head UUID REFERENCES public.users(id),
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 5. Club Memberships
```sql
-- Club memberships (multiple per user)
CREATE TABLE public.club_memberships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, club_id)
);
```

### 6. Club Posts
```sql
-- Club posts (real-time post creation)
CREATE TABLE public.club_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
  is_approved BOOLEAN DEFAULT true,
  flagged BOOLEAN DEFAULT false,
  moderation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 7. Mentors Table
```sql
-- Mentors table
CREATE TABLE public.mentors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  expertise TEXT[],
  experience_years INTEGER,
  bio TEXT,
  rating DECIMAL(3,2) DEFAULT 0.0,
  total_mentees INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);
```

### 8. Mentorship Connections
```sql
-- Mentorship connections
CREATE TABLE public.mentorships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mentor_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  mentee_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(mentor_id, mentee_id)
);
```

### 9. Chat Rooms
```sql
-- Chat rooms for mentorship
CREATE TABLE public.chat_rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  mentorship_id UUID REFERENCES public.mentorships(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 10. Messages
```sql
-- Messages for real-time chat
CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content TEXT NOT NULL,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 11. Room Memberships
```sql
-- Room memberships (for tracking who's in which chat room)
CREATE TABLE public.room_memberships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, room_id)
);
```

### 12. Content Moderation Logs
```sql
-- Content moderation logs
CREATE TABLE public.moderation_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'message')),
  content_id UUID NOT NULL,
  flagged_reason TEXT,
  moderator_action TEXT CHECK (moderator_action IN ('approved', 'deleted', 'pending')),
  gemini_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

## 🔐 Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
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

-- Clubs policies
CREATE POLICY "Everyone can view clubs" ON public.clubs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create clubs" ON public.clubs FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Club heads can update their clubs" ON public.clubs FOR UPDATE TO authenticated USING (club_head = auth.uid());

-- Club memberships policies
CREATE POLICY "Users can view club memberships" ON public.club_memberships FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own club memberships" ON public.club_memberships FOR ALL TO authenticated USING (user_id = auth.uid());

-- Club posts policies
CREATE POLICY "Club members can view posts" ON public.club_posts FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.club_memberships WHERE user_id = auth.uid() AND club_id = club_posts.club_id)
);
CREATE POLICY "Club members can create posts" ON public.club_posts FOR INSERT TO authenticated WITH CHECK (
  author_id = auth.uid() AND EXISTS (SELECT 1 FROM public.club_memberships WHERE user_id = auth.uid() AND club_id = club_posts.club_id)
);
CREATE POLICY "Authors can update own posts" ON public.club_posts FOR UPDATE TO authenticated USING (author_id = auth.uid());

-- Mentors policies
CREATE POLICY "Everyone can view mentors" ON public.mentors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own mentor profile" ON public.mentors FOR ALL TO authenticated USING (user_id = auth.uid());

-- Mentorships policies
CREATE POLICY "Users can view own mentorships" ON public.mentorships FOR SELECT TO authenticated USING (mentor_id = auth.uid() OR mentee_id = auth.uid());
CREATE POLICY "Users can create mentorship requests" ON public.mentorships FOR INSERT TO authenticated WITH CHECK (mentee_id = auth.uid());
CREATE POLICY "Mentors can update mentorship status" ON public.mentorships FOR UPDATE TO authenticated USING (mentor_id = auth.uid());

-- Chat rooms policies
CREATE POLICY "Users can view own chat rooms" ON public.chat_rooms FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.mentorships WHERE (mentor_id = auth.uid() OR mentee_id = auth.uid()) AND id = chat_rooms.mentorship_id)
);

-- Messages policies
CREATE POLICY "Room members can view messages" ON public.messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.room_memberships WHERE user_id = auth.uid() AND room_id = messages.room_id)
);
CREATE POLICY "Room members can send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (
  sender_id = auth.uid() AND EXISTS (SELECT 1 FROM public.room_memberships WHERE user_id = auth.uid() AND room_id = messages.room_id)
);

-- Room memberships policies
CREATE POLICY "Users can view own room memberships" ON public.room_memberships FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can join rooms" ON public.room_memberships FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Moderation logs policies (admin only)
CREATE POLICY "Admins can view moderation logs" ON public.moderation_logs FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
```

## 🔧 Database Functions

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
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.club_posts FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.mentorships FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Function to get user stats
CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'communities_joined', (
      SELECT COUNT(*) FROM public.community_memberships 
      WHERE user_id = user_uuid
    ),
    'active_clubs', (
      SELECT COUNT(*) FROM public.club_memberships 
      WHERE user_id = user_uuid
    ),
    'mentors', (
      SELECT COUNT(*) FROM public.mentors 
      WHERE user_id = user_uuid
    ),
    'active_connections', (
      SELECT COUNT(*) FROM public.mentorships 
      WHERE (mentor_id = user_uuid OR mentee_id = user_uuid) 
      AND status = 'accepted'
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🚀 Setup Instructions

1. **Create Supabase Project**:
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Create a new project
   - Note down your project URL and anon key

2. **Run SQL Commands**:
   - Copy all the SQL commands above
   - Run them in your Supabase SQL Editor in order

3. **Configure Environment Variables**:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_ADMIN_CODE=Createrkkrishavya
   VITE_GEMINI_API_KEY=your-gemini-api-key
   ```

4. **Test the Setup**:
   - Verify all tables are created
   - Test RLS policies
   - Check triggers are working

This schema provides a complete foundation for the U-Fresher application with all the required features!

