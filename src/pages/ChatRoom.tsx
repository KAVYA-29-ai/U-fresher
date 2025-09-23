import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft,
  Send,
  MessageCircle,
  Users,
  Clock,
  Smile,
  Paperclip,
  MoreVertical,
  Phone,
  Video
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';

interface ChatRoomProps {
  roomId: string;
  onBack: () => void;
}

const ChatRoom = ({ roomId, onBack }: ChatRoomProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { messages, room, loading, error, sendMessage } = useChat(roomId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      await sendMessage(newMessage);
      setNewMessage('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const renderMessage = (message: any) => {
    const isOwn = message.sender_id === user?.id;
    
    return (
      <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex gap-3 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          {!isOwn && (
            <Avatar className="w-8 h-8 ring-2 ring-blue-200">
              <AvatarImage src={message.sender?.profile_pic} alt={message.sender?.name} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-semibold">
                {message.sender?.name?.slice(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          )}
          <div className={`space-y-1 ${isOwn ? 'items-end' : 'items-start'}`}>
            {!isOwn && (
              <p className="text-xs text-slate-400 font-medium">{message.sender?.name || 'Unknown User'}</p>
            )}
            <div
              className={`px-4 py-2 rounded-2xl ${
                isOwn
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                  : 'bg-slate-700/80 backdrop-blur-sm border border-slate-600 text-slate-200'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
            </div>
            <p className="text-xs text-slate-400">{formatTime(message.created_at)}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-lg shadow-blue-500/10 rounded-none">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-slate-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <CardTitle className="text-lg text-white">
                  {room?.name || 'Chat Room'}
                </CardTitle>
                <CardDescription className="text-slate-300">
                  {room?.mentorship ? 
                    `Mentorship: ${room.mentorship.mentor.name} & ${room.mentorship.mentee.name}` :
                    'Club Discussion'
                  }
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-400">
                <Users className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-green-400">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-purple-400">
                <Video className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-300">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-8 h-8 rounded-full bg-slate-700" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-20 bg-slate-700" />
                  <Skeleton className="h-12 w-3/4 rounded-2xl bg-slate-700" />
                  <Skeleton className="h-3 w-16 bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <Card className="bg-red-900/20 border-red-800">
            <CardContent className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-300 mb-2">Error Loading Messages</h3>
              <p className="text-red-400">{error}</p>
            </CardContent>
          </Card>
        ) : messages.length > 0 ? (
          <>
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-blue-500/10 rounded-2xl">
              <CardContent className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Messages Yet</h3>
                <p className="text-slate-300 mb-4">Start the conversation by sending a message</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Message Input */}
      <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-lg shadow-blue-500/10 rounded-none">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-400">
              <Paperclip className="w-4 h-4" />
            </Button>
            <div className="flex-1 relative">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pr-12 bg-slate-700/50 border-slate-600 rounded-2xl text-white placeholder:text-slate-400"
                disabled={sending}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-blue-400"
              >
                <Smile className="w-4 h-4" />
              </Button>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-2xl"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatRoom;