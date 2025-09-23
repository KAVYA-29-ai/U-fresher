import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  MessageCircle, 
  GraduationCap, 
  Settings, 
  LogOut, 
  Heart,
  Building2,
  Crown,
  Star,
  TrendingUp,
  Shield,
  BarChart3,
  UserPlus,
  MessageSquare,
  Activity,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useStats } from '@/hooks/useStats';
import { useCommunities } from '@/hooks/useCommunities';
import { useClubs } from '@/hooks/useClubs';
import { useMentorship } from '@/hooks/useMentorship';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { authHelpers } from '@/lib/supabase';
import Communities from './Communities';
import Profile from './Profile';
import ChatRoom from './ChatRoom';
import AdminPanel from './AdminPanel';

interface DashboardProps {
  onLogout: () => void;
  onOpenClubPosts: (clubId: string, clubName: string) => void;
}

type ActiveView = 'dashboard' | 'communities' | 'profile' | 'chat' | 'admin' | 'mentors' | 'collaboration';

const Dashboard = ({ onLogout, onOpenClubPosts }: DashboardProps) => {
  const router = useRouter();
  const { user, userProfile, loading, session } = useAuth();
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedChatRoom, setSelectedChatRoom] = useState<string | null>(null);
  const { toast } = useToast();
  const { stats, loading: statsLoading } = useStats();
  const { communities, loading: communitiesLoading } = useCommunities();
  const { clubs, loading: clubsLoading } = useClubs();
  const { mentorships, loading: mentorshipsLoading } = useMentorship();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Dashboard router state:', router);
    }
  }, [router.isReady]);

  useEffect(() => {
    // Prevent redirect loops, only redirect after loading resolves and router is ready
    if (router.isReady && !loading) {
      if (!user || !userProfile) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('Dashboard: redirecting to signin due to missing user/userProfile');
        }
        router.replace('/signin');
      }
    }
  }, [router.isReady, loading, user, userProfile]);

  // Debugging logs
  if (process.env.NODE_ENV !== 'production') {
    console.debug('Dashboard session:', session);
    console.debug('Dashboard user:', user);
    console.debug('Dashboard userProfile:', userProfile);
    console.debug('Dashboard loading:', loading);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await authHelpers.signOut();
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      onLogout();
    }
  };

  const handleOpenChat = (roomId: string) => {
    setSelectedChatRoom(roomId);
    setActiveView('chat');
  };

  const renderNavigation = () => (
    <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-2xl shadow-blue-500/10 rounded-2xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 ring-2 ring-blue-200">
            <AvatarImage src={userProfile.profile_pic || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} alt={userProfile.name} />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold">
              {userProfile.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg text-white">{userProfile.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge 
                variant={userProfile.role === 'admin' ? 'destructive' : userProfile.role === 'mentor' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {userProfile.role === 'admin' && <Crown className="w-3 h-3 mr-1" />}
                {userProfile.role === 'mentor' && <Star className="w-3 h-3 mr-1" />}
                {userProfile.role}
              </Badge>
              {userProfile.role === 'mentor' && userProfile.available_for_mentorship && (
                <Badge variant="outline" className="text-xs text-green-400 border-green-600">
                  Available for Mentorship
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant={activeView === 'dashboard' ? 'default' : 'ghost'}
          className="w-full justify-start transition-all duration-200 hover:bg-slate-700 text-slate-200"
          onClick={() => setActiveView('dashboard')}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Dashboard
        </Button>
        <Button
          variant={activeView === 'communities' ? 'default' : 'ghost'}
          className="w-full justify-start transition-all duration-200 hover:bg-slate-700 text-slate-200"
          onClick={() => setActiveView('communities')}
        >
          <Building2 className="w-4 h-4 mr-2" />
          Communities
        </Button>
        <Button
          variant={activeView === 'mentors' ? 'default' : 'ghost'}
          className="w-full justify-start transition-all duration-200 hover:bg-slate-700 text-slate-200"
          onClick={() => setActiveView('mentors')}
        >
          <GraduationCap className="w-4 h-4 mr-2" />
          Mentors
        </Button>
        <Button
          variant={activeView === 'collaboration' ? 'default' : 'ghost'}
          className="w-full justify-start transition-all duration-200 hover:bg-slate-700 text-slate-200"
          onClick={() => setActiveView('collaboration')}
        >
          <Users className="w-4 h-4 mr-2" />
          Collaboration
        </Button>
        <Button
          variant={activeView === 'profile' ? 'default' : 'ghost'}
          className="w-full justify-start transition-all duration-200 hover:bg-slate-700 text-slate-200"
          onClick={() => setActiveView('profile')}
        >
          <Settings className="w-4 h-4 mr-2" />
          Profile
        </Button>
        {userProfile.role === 'admin' && (
          <Button
            variant={activeView === 'admin' ? 'default' : 'ghost'}
            className="w-full justify-start transition-all duration-200 hover:bg-slate-700 text-slate-200"
            onClick={() => setActiveView('admin')}
          >
            <Shield className="w-4 h-4 mr-2" />
            Admin Panel
          </Button>
        )}
        <div className="pt-4 border-t border-slate-600">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all duration-200"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStatsCard = (title: string, value: number, icon: React.ReactNode, color: string, loading: boolean) => (
    <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-blue-500/10 rounded-2xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-300">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${color}`}> 
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16 mb-2 bg-slate-700" />
        ) : (
          <div className="text-3xl font-bold text-white mb-2">{value}</div>
        )}
        <span className="text-xs text-slate-400">
          Real-time data from Supabase
        </span>
      </CardContent>
    </Card>
  );

  const renderDashboardOverview = () => (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Welcome back to U-Fresher
        </h1>
        <Heart className="w-8 h-8 text-pink-400" />
      </div>

      {/* Real Stats from Supabase */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderStatsCard(
          "Communities Joined",
          stats.communities_joined,
          <Building2 className="h-5 w-5 text-blue-400" />,
          "bg-blue-900/30",
          statsLoading
        )}
        {renderStatsCard(
          "Active Clubs",
          stats.active_clubs,
          <Users className="h-5 w-5 text-green-400" />,
          "bg-green-900/30",
          statsLoading
        )}
        {renderStatsCard(
          "Total Mentors",
          stats.mentors,
          <GraduationCap className="h-5 w-5 text-purple-400" />,
          "bg-purple-900/30",
          statsLoading
        )}
        {renderStatsCard(
          "Active Connections",
          stats.active_connections,
          <UserPlus className="h-5 w-5 text-orange-400" />,
          "bg-orange-900/30",
          statsLoading
        )}
      </div>

      {/* Recent Communities */}
      <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-blue-500/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-white">Your Communities</CardTitle>
          <CardDescription className="text-slate-300">Communities you're part of</CardDescription>
        </CardHeader>
        <CardContent>
          {communitiesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-slate-600">
                  <Skeleton className="w-12 h-12 rounded-full bg-slate-700" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2 bg-slate-700" />
                    <Skeleton className="h-3 w-48 bg-slate-700" />
                  </div>
                </div>
              ))}
            </div>
          ) : communities.length > 0 ? (
            <div className="space-y-4">
              {communities.slice(0, 3).map((community) => (
                <div key={community.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-600 hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {community.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{community.name}</p>
                      <p className="text-sm text-slate-300">{community.college_name}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-200">
                    {community.member_count || 0} members
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-300 mb-4">You haven't joined any communities yet</p>
              <Button 
                onClick={() => setActiveView('communities')}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
              >
                Explore Communities
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-blue-500/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-white">Quick Actions</CardTitle>
          <CardDescription className="text-slate-300">Get started with common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              onClick={() => setActiveView('communities')}
              className="h-auto p-6 flex-col gap-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white transition-all duration-200 transform hover:scale-105"
            >
              <Building2 className="w-8 h-8" />
              <span className="font-semibold">Explore Communities</span>
              <span className="text-sm opacity-90">Join your college community</span>
            </Button>
            <Button 
              onClick={() => setActiveView('mentors')}
              variant="outline"
              className="h-auto p-6 flex-col gap-3 border-2 border-green-600 hover:bg-green-900/20 transition-all duration-200 transform hover:scale-105 text-green-400"
            >
              <GraduationCap className="w-8 h-8 text-green-400" />
              <span className="font-semibold text-green-400">Find Mentors</span>
              <span className="text-sm text-green-300">Connect with experienced mentors</span>
            </Button>
            <Button 
              onClick={() => setActiveView('profile')}
              variant="outline"
              className="h-auto p-6 flex-col gap-3 border-2 border-purple-600 hover:bg-purple-900/20 transition-all duration-200 transform hover:scale-105 text-purple-400"
            >
              <Settings className="w-8 h-8 text-purple-400" />
              <span className="font-semibold text-purple-400">Update Profile</span>
              <span className="text-sm text-purple-300">Manage your information</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'communities':
        return <Communities onOpenChat={handleOpenChat} onOpenClubPosts={onOpenClubPosts} />;
      case 'profile':
        return <Profile />;
      case 'chat':
        return selectedChatRoom ? (
          <ChatRoom 
            roomId={selectedChatRoom} 
            onBack={() => setActiveView('communities')} 
          />
        ) : null;
      case 'admin':
        return userProfile.role === 'admin' ? <AdminPanel /> : (
          <div className="text-center py-8">
            <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Access Denied</h3>
            <p className="text-slate-300">You don't have admin privileges to access this panel.</p>
          </div>
        );
      case 'mentors':
        return <MentorsView />;
      case 'collaboration':
        return <CollaborationView />;
      default:
        return renderDashboardOverview();
    }
  };

  const MentorsView = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
          Mentors & Mentorship
        </h1>
        <GraduationCap className="w-8 h-8 text-green-400" />
      </div>
      
      {/* Mentor Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-green-500/10 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Available Mentors</CardTitle>
            <GraduationCap className="h-5 w-5 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">12</div>
            <p className="text-xs text-slate-400">Active mentors ready to help</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-blue-500/10 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Active Mentorships</CardTitle>
            <Users className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">8</div>
            <p className="text-xs text-slate-400">Ongoing mentorship relationships</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-purple-500/10 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Success Rate</CardTitle>
            <Star className="h-5 w-5 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">95%</div>
            <p className="text-xs text-slate-400">Student satisfaction rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Mentor Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-green-500/10 rounded-2xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-green-400" />
              Academic Mentors
            </CardTitle>
            <CardDescription className="text-slate-300">
              Get help with studies and coursework
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-300 mb-4">
              Connect with experienced students and alumni who can guide you through your academic journey.
            </p>
            <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
              Find Academic Mentor
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-blue-500/10 rounded-2xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Career Mentors
            </CardTitle>
            <CardDescription className="text-slate-300">
              Professional guidance and career advice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-300 mb-4">
              Get career advice from industry professionals and alumni working in your field of interest.
            </p>
            <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">
              Find Career Mentor
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-purple-500/10 rounded-2xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-400" />
              Project Mentors
            </CardTitle>
            <CardDescription className="text-slate-300">
              Guidance for projects and research
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-300 mb-4">
              Work with mentors who can help you with specific projects, research, and technical challenges.
            </p>
            <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
              Find Project Mentor
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Featured Mentors */}
      <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-green-500/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-white">Featured Mentors</CardTitle>
          <CardDescription className="text-slate-300">Top-rated mentors in our community</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <GraduationCap className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Mentorship Platform Coming Soon</h3>
            <p className="text-slate-300 mb-6">We're building an amazing mentorship platform with advanced matching and communication features</p>
            <div className="flex gap-4 justify-center">
              <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                Get Notified
              </Button>
              <Button variant="outline" className="border-green-600 text-green-400 hover:bg-green-900/20">
                Learn More
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const CollaborationView = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Project Collaboration
        </h1>
        <Users className="w-8 h-8 text-purple-400" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-purple-500/10 rounded-2xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              Find Collaborators
            </CardTitle>
            <CardDescription className="text-slate-300">
              Discover students working on similar projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-300 mb-4">
              Connect with fellow students who share your interests and skills for collaborative projects.
            </p>
            <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
              Browse Projects
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-blue-500/10 rounded-2xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Start a Project
            </CardTitle>
            <CardDescription className="text-slate-300">
              Create and share your project ideas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-300 mb-4">
              Post your project ideas and invite others to join your team for collaborative work.
            </p>
            <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">
              Create Project
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-green-500/10 rounded-2xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-400" />
              Skill Matching
            </CardTitle>
            <CardDescription className="text-slate-300">
              Find team members with specific skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-300 mb-4">
              Match with students who have the skills you need for your project or offer your expertise.
            </p>
            <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
              Match Skills
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-purple-500/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-white">Active Projects</CardTitle>
          <CardDescription className="text-slate-300">Projects currently looking for collaborators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Collaboration Platform Coming Soon</h3>
            <p className="text-slate-300 mb-6">We're building an amazing project collaboration platform for you</p>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
              Get Notified
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {renderNavigation()}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;