import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Community {
  id: string;
  name: string;
  description: string | null;
  college_name: string;
  created_by: string | null;
  created_at: string;
  member_count?: number;
  is_member?: boolean;
}

export const useCommunities = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('communities')
        .select(`
          *,
          community_memberships(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to include member_count
      const transformedData = (data || []).map(community => ({
        ...community,
        member_count: community.community_memberships?.[0]?.count || 0
      }));
      
      setCommunities(transformedData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching communities:', err);
    } finally {
      setLoading(false);
    }
  };

  const joinCommunity = async (communityId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if user is already a member of a community
      const { data: existingMembership } = await supabase
        .from('community_memberships')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (existingMembership) {
        throw new Error('You can only join one college community');
      }

      const { error } = await supabase
        .from('community_memberships')
        .insert({
          user_id: user.id,
          community_id: communityId
        });

      if (error) throw error;

      // Refresh communities
      await fetchCommunities();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const leaveCommunity = async (communityId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('community_memberships')
        .delete()
        .eq('user_id', user.id)
        .eq('community_id', communityId);

      if (error) throw error;

      // Refresh communities
      await fetchCommunities();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const getUserCommunity = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('community_memberships')
        .select(`
          community:communities(*)
        `)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data?.community || null;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  return {
    communities,
    loading,
    error,
    joinCommunity,
    leaveCommunity,
    getUserCommunity,
    refetch: fetchCommunities
  };
};

