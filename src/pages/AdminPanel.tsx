import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Building, 
  Users, 
  MessageCircle, 
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Settings,
  BarChart3,
  Crown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCommunities } from '@/hooks/useCommunities';
import { useClubs } from '@/hooks/useClubs';
import { supabase } from '@/lib/supabase';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [moderationEnabled, setModerationEnabled] = useState(true);
  const [newCommunity, setNewCommunity] = useState({ name: '', description: '', college_name: '' });
  const [newClub, setNewClub] = useState({ name: '', description: '', communityId: '' });
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCommunities: 0,
    totalClubs: 0,
    flaggedContent: 0
  });
  const [loading, setLoading] = useState(true);
  
  const { user, userProfile } = useAuth();
  const { communities, loading: communitiesLoading } = useCommunities();
  const { clubs, loading: clubsLoading } = useClubs();
  const { toast } = useToast();

  // Fetch admin stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Get total users
        const { count: userCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        
        // Get total communities
        const { count: communityCount } = await supabase
          .from('communities')
          .select('*', { count: 'exact', head: true });
        
        // Get total clubs
        const { count: clubCount } = await supabase
          .from('clubs')
          .select('*', { count: 'exact', head: true });
        
        // Get flagged content count
        const { count: flaggedCount } = await supabase
          .from('moderation_logs')
          .select('*', { count: 'exact', head: true })
          .eq('moderator_action', 'pending');
        
        setStats({
          totalUsers: userCount || 0,
          totalCommunities: communityCount || 0,
          totalClubs: clubCount || 0,
          flaggedContent: flaggedCount || 0
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (!user || !userProfile || userProfile.role !== 'admin') {
    return (
      <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-2xl shadow-red-500/10 rounded-2xl">
        <CardContent className="p-6 text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <h3 className="text-lg font-semibold mb-2 text-white">Access Denied</h3>
          <p className="text-slate-300">You don't have admin privileges to access this panel.</p>
        </CardContent>
      </Card>
    );
  }

  const createCommunity = async () => {
    if (!newCommunity.name.trim() || !newCommunity.college_name.trim()) {
      toast({
        title: "Error",
        description: "Community name and college name are required",
        variant: "destructive"
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('communities')
        .insert({
          name: newCommunity.name,
          description: newCommunity.description,
          college_name: newCommunity.college_name,
          created_by: user.id
        });

      if (error) {
        throw error;
      }

      setNewCommunity({ name: '', description: '', college_name: '' });
      toast({
        title: "Community Created!",
        description: `${newCommunity.name} has been successfully created`,
      });
      
      // Refresh communities list
      window.location.reload();
    } catch (error: any) {
      console.error('Error creating community:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create community",
        variant: "destructive"
      });
    }
  };

  const createClub = async () => {
    if (!newClub.name.trim() || !newClub.communityId) {
      toast({
        title: "Error",
        description: "Club name and community selection are required",
        variant: "destructive"
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('clubs')
        .insert({
          name: newClub.name,
          description: newClub.description,
          community_id: newClub.communityId,
          club_head: userProfile?.name || 'Admin',
          created_by: user.id
        });

      if (error) {
        throw error;
      }

      setNewClub({ name: '', description: '', communityId: '' });
      toast({
        title: "Club Created!",
        description: `${newClub.name} has been successfully created`,
      });
      
      // Refresh clubs list
      window.location.reload();
    } catch (error: any) {
      console.error('Error creating club:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create club",
        variant: "destructive"
      });
    }
  };

  const deleteCommunity = async (communityId: string) => {
    try {
      const { error } = await supabase
        .from('communities')
        .delete()
        .eq('id', communityId);

      if (error) {
        throw error;
      }

      toast({
        title: "Community Deleted",
        description: "Community has been removed",
        variant: "destructive"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete community",
        variant: "destructive"
      });
    }
  };

  const deleteClub = async (clubId: string) => {
    try {
      const { error } = await supabase
        .from('clubs')
        .delete()
        .eq('id', clubId);

      if (error) {
        throw error;
      }

      toast({
        title: "Club Deleted",
        description: "Club has been removed",
        variant: "destructive"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete club",
        variant: "destructive"
      });
    }
  };

  // Mock flagged content
  const flaggedContent = [
    {
      id: '1',
      type: 'message',
      content: 'This is a flagged message that contains inappropriate content',
      author: 'John Doe',
      flaggedReason: 'Inappropriate language detected by AI',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      type: 'message',
      content: 'Another message that was flagged for spam',
      author: 'Jane Smith',
      flaggedReason: 'Potential spam content',
      timestamp: '4 hours ago'
    }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-blue-500/10 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {loading ? '...' : stats.totalUsers}
            </div>
            <p className="text-xs text-slate-400">Registered users</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-green-500/10 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Communities</CardTitle>
            <Building className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {loading ? '...' : stats.totalCommunities}
            </div>
            <p className="text-xs text-slate-400">Active communities</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-purple-500/10 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Clubs</CardTitle>
            <Users className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {loading ? '...' : stats.totalClubs}
            </div>
            <p className="text-xs text-slate-400">Across all communities</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-red-500/10 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Flagged Content</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {loading ? '...' : stats.flaggedContent}
            </div>
            <p className="text-xs text-slate-400">Pending review</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-blue-500/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white">Platform Health</CardTitle>
          <CardDescription className="text-slate-300">Key metrics and system status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-slate-200">AI Moderation System</span>
              </div>
              <Badge variant="default" className="bg-green-600 text-white">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-400" />
                <span className="text-slate-200">Real-time Messaging</span>
              </div>
              <Badge variant="default" className="bg-green-600 text-white">Operational</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span className="text-slate-200">User Authentication</span>
              </div>
              <Badge variant="default" className="bg-green-600 text-white">Healthy</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCommunityManagement = () => (
    <div className="space-y-6">
      {/* Create Community */}
      <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-blue-500/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white">Create New Community</CardTitle>
          <CardDescription className="text-slate-300">Add a new college or organization community</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="community-name" className="text-slate-200">Community Name</Label>
              <Input
                id="community-name"
                placeholder="e.g., MIT University"
                value={newCommunity.name}
                onChange={(e) => setNewCommunity({...newCommunity, name: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="college-name" className="text-slate-200">College Name</Label>
              <Input
                id="college-name"
                placeholder="e.g., Massachusetts Institute of Technology"
                value={newCommunity.college_name}
                onChange={(e) => setNewCommunity({...newCommunity, college_name: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="community-desc" className="text-slate-200">Description</Label>
              <Textarea
                id="community-desc"
                placeholder="Brief description of the community"
                value={newCommunity.description}
                onChange={(e) => setNewCommunity({...newCommunity, description: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
          <Button onClick={createCommunity} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create Community
          </Button>
        </CardContent>
      </Card>

      {/* Existing Communities */}
      <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-blue-500/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white">Manage Communities</CardTitle>
          <CardDescription className="text-slate-300">View and manage existing communities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {communitiesLoading ? (
              <div className="text-center py-4 text-slate-300">Loading communities...</div>
            ) : communities.length > 0 ? (
              communities.map((community) => (
                <div key={community.id} className="flex items-center justify-between p-4 border border-slate-600 rounded-lg bg-slate-700/50">
                  <div>
                    <h4 className="font-medium text-white">{community.name}</h4>
                    <p className="text-sm text-slate-300">{community.college_name}</p>
                    {community.description && (
                      <p className="text-sm text-slate-400 mt-1">{community.description}</p>
                    )}
                    <Badge variant="secondary" className="text-xs mt-2 bg-slate-600 text-slate-200">
                      {community.member_count || 0} members
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteCommunity(community.id)}
                    className="text-red-400 border-red-600 hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-slate-400">No communities found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderClubManagement = () => (
    <div className="space-y-6">
      {/* Create Club */}
      <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-green-500/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white">Create New Club</CardTitle>
          <CardDescription className="text-slate-300">Add a new club to a community</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="club-name" className="text-slate-200">Club Name</Label>
              <Input
                id="club-name"
                placeholder="e.g., AI Research Group"
                value={newClub.name}
                onChange={(e) => setNewClub({...newClub, name: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="club-community" className="text-slate-200">Community</Label>
              <select
                id="club-community"
                className="w-full p-2 border border-slate-600 rounded-md bg-slate-700 text-white"
                value={newClub.communityId}
                onChange={(e) => setNewClub({...newClub, communityId: e.target.value})}
              >
                <option value="">Select Community</option>
                {communities.map((community) => (
                  <option key={community.id} value={community.id}>
                    {community.name} - {community.college_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="club-desc" className="text-slate-200">Description</Label>
              <Textarea
                id="club-desc"
                placeholder="Club description"
                value={newClub.description}
                onChange={(e) => setNewClub({...newClub, description: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
          <Button onClick={createClub} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create Club
          </Button>
        </CardContent>
      </Card>

      {/* Existing Clubs */}
      <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-green-500/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white">Manage Clubs</CardTitle>
          <CardDescription className="text-slate-300">View and manage existing clubs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clubsLoading ? (
              <div className="text-center py-4 text-slate-300">Loading clubs...</div>
            ) : clubs.length > 0 ? (
              clubs.map((club) => {
                const community = communities.find(c => c.id === club.community_id);
                return (
                  <div key={club.id} className="flex items-center justify-between p-4 border border-slate-600 rounded-lg bg-slate-700/50">
                    <div>
                      <h4 className="font-medium text-white">{club.name}</h4>
                      <p className="text-sm text-slate-300">{club.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs bg-slate-600 text-slate-200">
                          {community?.name || 'Unknown Community'}
                        </Badge>
                        <Badge variant="outline" className="text-xs border-slate-500 text-slate-300">
                          {club.member_count || 0} members
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteClub(club.id)}
                      className="text-red-400 border-red-600 hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-slate-400">No clubs found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderModeration = () => (
    <div className="space-y-6">
      {/* Moderation Settings */}
      <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-red-500/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white">Moderation Settings</CardTitle>
          <CardDescription className="text-slate-300">Configure AI moderation and safety features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="moderation-toggle" className="text-slate-200">AI Content Moderation</Label>
              <p className="text-sm text-slate-400">
                Automatically flag inappropriate content using Gemini AI
              </p>
            </div>
            <Switch
              id="moderation-toggle"
              checked={moderationEnabled}
              onCheckedChange={setModerationEnabled}
            />
          </div>
          {!moderationEnabled && (
            <div className="p-4 border border-red-600/50 rounded-lg bg-red-900/20">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Warning: AI Moderation Disabled</span>
              </div>
              <p className="text-sm text-red-300 mt-1">
                Disabling AI moderation may allow inappropriate content to be posted.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Flagged Content */}
      <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-red-500/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white">Flagged Content Review</CardTitle>
          <CardDescription className="text-slate-300">Review and moderate flagged content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {flaggedContent.map((item) => (
              <div key={item.id} className="p-4 border border-red-600/50 rounded-lg bg-red-900/10">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Badge variant="destructive" className="text-xs mb-2">
                      {item.type}
                    </Badge>
                    <p className="text-sm text-slate-400">
                      By {item.author} • {item.timestamp}
                    </p>
                  </div>
                </div>
                
                <div className="mb-3 p-3 bg-slate-700/50 rounded border-l-4 border-l-red-500">
                  <p className="text-sm text-slate-200">{item.content}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-red-400">
                    AI Flagged: {item.flaggedReason}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive">
                    <XCircle className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            
            {flaggedContent.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No flagged content to review</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Crown className="w-8 h-8 text-yellow-400" />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Admin Panel</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-slate-700/50">
          <TabsTrigger value="overview" className="text-slate-200 data-[state=active]:bg-slate-600">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="communities" className="text-slate-200 data-[state=active]:bg-slate-600">
            <Building className="w-4 h-4 mr-2" />
            Communities
          </TabsTrigger>
          <TabsTrigger value="clubs" className="text-slate-200 data-[state=active]:bg-slate-600">
            <Users className="w-4 h-4 mr-2" />
            Clubs
          </TabsTrigger>
          <TabsTrigger value="moderation" className="text-slate-200 data-[state=active]:bg-slate-600">
            <Shield className="w-4 h-4 mr-2" />
            Moderation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="communities">
          {renderCommunityManagement()}
        </TabsContent>

        <TabsContent value="clubs">
          {renderClubManagement()}
        </TabsContent>

        <TabsContent value="moderation">
          {renderModeration()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;