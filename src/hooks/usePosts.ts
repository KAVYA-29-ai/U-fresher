import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { contentModeration } from '@/lib/gemini';
import { config } from '@/lib/config';

export interface Post {
  id: string;
  content: string;
  author_id: string;
  club_id: string;
  is_approved: boolean;
  flagged: boolean;
  moderation_reason: string | null;
  created_at: string;
  updated_at: string;
  author?: {
    name: string;
    profile_pic: string | null;
  };
}

export const usePosts = (clubId: string) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('club_posts')
        .select(`
          *,
          author:users(name, profile_pic)
        `)
        .eq('club_id', clubId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (content: string) => {
    try {
      setError(null);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let moderationResult = { flagged: false };
      
      // Check if moderation is enabled
      if (config.moderation.enabled) {
        moderationResult = await contentModeration.moderateContent(content);
      }

      const { data, error } = await supabase
        .from('club_posts')
        .insert({
          content,
          author_id: user.id,
          club_id: clubId,
          is_approved: !moderationResult.flagged,
          flagged: moderationResult.flagged,
          moderation_reason: moderationResult.reason || null
        })
        .select(`
          *,
          author:users(name, profile_pic)
        `)
        .single();

      if (error) throw error;

      // Add to posts list
      setPosts(prev => [data, ...prev]);

      // Log moderation if flagged
      if (moderationResult.flagged) {
        await supabase
          .from('moderation_logs')
          .insert({
            content_type: 'post',
            content_id: data.id,
            flagged_reason: moderationResult.reason,
            moderator_action: 'pending',
            gemini_response: moderationResult
          });
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('club_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    if (clubId) {
      fetchPosts();
    }
  }, [clubId]);

  return {
    posts,
    loading,
    error,
    createPost,
    deletePost,
    refetch: fetchPosts
  };
};

