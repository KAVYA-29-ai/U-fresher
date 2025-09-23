import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft,
  Send,
  MessageCircle,
  Users,
  Calendar,
  Flag,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface ClubPostsProps {
  clubId: string;
  clubName: string;
  onBack: () => void;
}

const ClubPosts = ({ clubId, clubName, onBack }: ClubPostsProps) => {
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const { posts, loading, error, createPost, deletePost } = usePosts(clubId);

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    try {
      setPosting(true);
      await createPost(newPost);
      setNewPost('');
      toast({
        title: "Success!",
        description: "Your post has been created successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create post.",
        variant: "destructive"
      });
    } finally {
      setPosting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId);
      toast({
        title: "Success!",
        description: "Post deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete post.",
        variant: "destructive"
      });
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const renderPost = (post: any) => (
    <Card key={post.id} className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-lg shadow-blue-500/5 rounded-2xl hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 ring-2 ring-blue-200">
              <AvatarImage src={post.author?.profile_pic} alt={post.author?.name} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold">
                {post.author?.name?.slice(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base text-white">{post.author?.name || 'Unknown User'}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Calendar className="w-3 h-3" />
                <span>{formatTimeAgo(post.created_at)}</span>
                {post.flagged && (
                  <Badge variant="destructive" className="text-xs">
                    <Flag className="w-3 h-3 mr-1" />
                    Flagged
                  </Badge>
                )}
                {!post.is_approved && (
                  <Badge variant="secondary" className="text-xs bg-slate-600 text-slate-200">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending Review
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {user?.id === post.author_id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeletePost(post.id)}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-slate-200 leading-relaxed">{post.content}</p>
          
          {post.moderation_reason && (
            <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Moderation Notice</span>
              </div>
              <p className="text-sm text-yellow-300 mt-1">{post.moderation_reason}</p>
            </div>
          )}

          <div className="flex items-center gap-4 pt-3 border-t border-slate-600">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-400">
              <MessageCircle className="w-4 h-4 mr-2" />
              Comment
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-green-400">
              <CheckCircle className="w-4 h-4 mr-2" />
              Like
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <h1 className="text-3xl font-bold text-white">{clubName}</h1>
          <p className="text-slate-300">Share your thoughts and connect with club members</p>
        </div>
      </div>

      {/* Create Post */}
      <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-blue-500/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg text-white">Create a Post</CardTitle>
          <CardDescription className="text-slate-300">
            Share your thoughts, ask questions, or start a discussion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="min-h-[100px] bg-slate-700/50 border-slate-600 rounded-xl resize-none text-white placeholder:text-slate-400"
          />
          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-400">
              {newPost.length}/500 characters
            </div>
            <Button
              onClick={handleCreatePost}
              disabled={!newPost.trim() || posting || newPost.length > 500}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
            >
              {posting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Posting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Post
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Recent Posts</h2>
          <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
            {posts.length} posts
          </Badge>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-lg shadow-blue-500/5 rounded-2xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full bg-slate-700" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-2 bg-slate-700" />
                      <Skeleton className="h-3 w-16 bg-slate-700" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2 bg-slate-700" />
                  <Skeleton className="h-4 w-3/4 mb-4 bg-slate-700" />
                  <div className="flex gap-4">
                    <Skeleton className="h-6 w-16 bg-slate-700" />
                    <Skeleton className="h-6 w-12 bg-slate-700" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="bg-red-900/20 border-red-800 rounded-2xl">
            <CardContent className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-300 mb-2">Error Loading Posts</h3>
              <p className="text-red-400">{error}</p>
            </CardContent>
          </Card>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map(renderPost)}
          </div>
        ) : (
          <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-blue-500/10 rounded-2xl">
            <CardContent className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Posts Yet</h3>
              <p className="text-slate-300 mb-4">Be the first to share something with the club</p>
              <Button
                onClick={() => document.querySelector('textarea')?.focus()}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Create First Post
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClubPosts;