import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface UserStats {
  communities_joined: number;
  active_clubs: number;
  mentors: number;
  active_connections: number;
}

export const useStats = () => {
  const [stats, setStats] = useState<UserStats>({
    communities_joined: 0,
    active_clubs: 0,
    mentors: 0,
    active_connections: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get communities joined
      const { count: communitiesCount } = await supabase
        .from('community_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get active clubs
      const { count: clubsCount } = await supabase
        .from('club_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get mentors count
      const { count: mentorsCount } = await supabase
        .from('mentors')
        .select('*', { count: 'exact', head: true });

      // Get active connections
      const { count: connectionsCount } = await supabase
        .from('mentorships')
        .select('*', { count: 'exact', head: true })
        .or(`mentor_id.eq.${user.id},mentee_id.eq.${user.id}`)
        .eq('status', 'accepted');

      setStats({
        communities_joined: communitiesCount || 0,
        active_clubs: clubsCount || 0,
        mentors: mentorsCount || 0,
        active_connections: connectionsCount || 0
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};

