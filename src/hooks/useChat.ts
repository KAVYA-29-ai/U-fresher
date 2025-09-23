import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { contentModeration } from '@/lib/gemini';
import { config } from '@/lib/config';

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  room_id: string;
  message_type: 'text' | 'image' | 'file';
  created_at: string;
  sender?: {
    name: string;
    profile_pic: string | null;
  };
}

export interface ChatRoom {
  id: string;
  name: string;
  mentorship_id: string | null;
  created_by: string | null;
  created_at: string;
  mentorship?: {
    mentor: {
      name: string;
      profile_pic: string | null;
    };
    mentee: {
      name: string;
      profile_pic: string | null;
    };
  };
}

export const useChat = (roomId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users(name, profile_pic)
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoom = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          mentorship:mentorships(
            mentor:users!mentor_id(name, profile_pic),
            mentee:users!mentee_id(name, profile_pic)
          )
        `)
        .eq('id', roomId)
        .single();

      if (error) throw error;
      setRoom(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const sendMessage = async (content: string, messageType: 'text' | 'image' | 'file' = 'text') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let moderationResult = { flagged: false };
      
      // Check if moderation is enabled for text messages
      if (config.moderation.enabled && messageType === 'text') {
        moderationResult = await contentModeration.moderateContent(content);
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          content,
          sender_id: user.id,
          room_id: roomId,
          message_type: messageType
        })
        .select(`
          *,
          sender:users(name, profile_pic)
        `)
        .single();

      if (error) throw error;

      // Add to messages list
      setMessages(prev => [...prev, data]);

      // Log moderation if flagged
      if (moderationResult.flagged) {
        await supabase
          .from('moderation_logs')
          .insert({
            content_type: 'message',
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

  const joinRoom = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('room_memberships')
        .insert({
          user_id: user.id,
          room_id: roomId
        });

      if (error && error.code !== '23505') throw error; // Ignore duplicate key error
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    if (roomId) {
      fetchRoom();
      fetchMessages();
      joinRoom();

      // Set up real-time subscription
      const subscription = supabase
        .channel(`room:${roomId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `room_id=eq.${roomId}`
          },
          (payload) => {
            const newMessage = payload.new as Message;
            setMessages(prev => [...prev, newMessage]);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [roomId]);

  return {
    messages,
    room,
    loading,
    error,
    sendMessage,
    refetch: fetchMessages
  };
};

