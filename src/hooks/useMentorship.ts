import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Mentor {
  id: string;
  user_id: string;
  expertise: string[] | null;
  experience_years: number | null;
  bio: string | null;
  rating: number;
  total_mentees: number;
  created_at: string;
  user?: {
    name: string;
    profile_pic: string | null;
    college: string | null;
    stream: string | null;
  };
}

export interface Mentorship {
  id: string;
  mentor_id: string;
  mentee_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: string;
  updated_at: string;
  mentor?: {
    name: string;
    profile_pic: string | null;
  };
  mentee?: {
    name: string;
    profile_pic: string | null;
  };
}

export const useMentorship = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mentors')
        .select(`
          *,
          user:users(name, profile_pic, college, stream)
        `)
        .order('rating', { ascending: false });

      if (error) throw error;
      setMentors(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMentorships = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('mentorships')
        .select(`
          *,
          mentor:users!mentor_id(name, profile_pic),
          mentee:users!mentee_id(name, profile_pic)
        `)
        .or(`mentor_id.eq.${user.id},mentee_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMentorships(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const requestMentorship = async (mentorId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('mentorships')
        .insert({
          mentor_id: mentorId,
          mentee_id: user.id,
          status: 'pending'
        })
        .select(`
          *,
          mentor:users!mentor_id(name, profile_pic),
          mentee:users!mentee_id(name, profile_pic)
        `)
        .single();

      if (error) throw error;

      setMentorships(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateMentorshipStatus = async (mentorshipId: string, status: 'accepted' | 'rejected' | 'completed') => {
    try {
      const { data, error } = await supabase
        .from('mentorships')
        .update({ status })
        .eq('id', mentorshipId)
        .select(`
          *,
          mentor:users!mentor_id(name, profile_pic),
          mentee:users!mentee_id(name, profile_pic)
        `)
        .single();

      if (error) throw error;

      setMentorships(prev => 
        prev.map(mentorship => 
          mentorship.id === mentorshipId ? data : mentorship
        )
      );

      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const becomeMentor = async (expertise: string[], experienceYears: number, bio: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('mentors')
        .insert({
          user_id: user.id,
          expertise,
          experience_years: experienceYears,
          bio
        })
        .select(`
          *,
          user:users(name, profile_pic, college, stream)
        `)
        .single();

      if (error) throw error;

      setMentors(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const getActiveConnections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from('mentorships')
        .select('*', { count: 'exact', head: true })
        .or(`mentor_id.eq.${user.id},mentee_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (error) throw error;
      return count || 0;
    } catch (err: any) {
      setError(err.message);
      return 0;
    }
  };

  useEffect(() => {
    fetchMentors();
    fetchMentorships();
  }, []);

  return {
    mentors,
    mentorships,
    loading,
    error,
    requestMentorship,
    updateMentorshipStatus,
    becomeMentor,
    getActiveConnections,
    refetch: () => {
      fetchMentors();
      fetchMentorships();
    }
  };
};

