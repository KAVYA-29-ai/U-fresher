import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Club {
  id: string;
  name: string;
  description: string | null;
  community_id: string;
  club_head: string | null;
  created_by: string | null;
  created_at: string;
  member_count?: number;
  is_member?: boolean;
  community?: {
    name: string;
    college_name: string;
  };
}

export const useClubs = (communityId?: string) => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('clubs')
        .select(`
          *,
          club_memberships(count),
          community:communities(name, college_name)
        `);

      if (communityId) {
        query = query.eq('community_id', communityId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to include member_count
      const transformedData = (data || []).map(club => ({
        ...club,
        member_count: club.club_memberships?.[0]?.count || 0
      }));
      
      setClubs(transformedData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching clubs:', err);
    } finally {
      setLoading(false);
    }
  };

  const joinClub = async (clubId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('club_memberships')
        .insert({
          user_id: user.id,
          club_id: clubId
        });

      if (error) throw error;

      // Refresh clubs
      await fetchClubs();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const leaveClub = async (clubId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('club_memberships')
        .delete()
        .eq('user_id', user.id)
        .eq('club_id', clubId);

      if (error) throw error;

      // Refresh clubs
      await fetchClubs();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const createClub = async (name: string, description: string, communityId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('clubs')
        .insert({
          name,
          description,
          community_id: communityId,
          created_by: user.id,
          club_head: user.id
        })
        .select(`
          *,
          community:communities(name, college_name)
        `)
        .single();

      if (error) throw error;

      // Auto-join the club as creator
      const { error: joinError } = await supabase
        .from('club_memberships')
        .insert({
          user_id: user.id,
          club_id: data.id
        });

      if (joinError) {
        console.error('Error auto-joining club:', joinError);
      }

      // Refresh clubs list
      await fetchClubs();

      return data;
    } catch (err: any) {
      setError(err.message);
      console.error('Error creating club:', err);
      throw err;
    }
  };

  const getUserClubs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('club_memberships')
        .select(`
          club:clubs(
            *,
            community:communities(name, college_name)
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return data?.map(item => item.club) || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    }
  };

  useEffect(() => {
    fetchClubs();
  }, [communityId]);

  return {
    clubs,
    loading,
    error,
    joinClub,
    leaveClub,
    createClub,
    getUserClubs,
    refetch: fetchClubs
  };
};

