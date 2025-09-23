import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, 
  Users, 
  Plus, 
  Search, 
  MapPin, 
  Calendar,
  UserPlus,
  MessageCircle,
  MessageSquare,
  Star,
  Crown,
  Heart,
  Zap,
  BookOpen,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCommunities } from '@/hooks/useCommunities';
import { useClubs } from '@/hooks/useClubs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface CommunitiesProps {
  onOpenChat: (roomId: string) => void;
  onOpenClubPosts: (clubId: string, clubName: string) => void;
}

const Communities = ({ onOpenChat, onOpenClubPosts }: CommunitiesProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);
  const [showCreateClub, setShowCreateClub] = useState(false);
  const [newClubName, setNewClubName] = useState('');
  const [newClubDescription, setNewClubDescription] = useState('');
  const [creatingClub, setCreatingClub] = useState(false);
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const { 
    communities, 
    loading: communitiesLoading, 
    joinCommunity, 
    leaveCommunity, 
    getUserCommunity 
  } = useCommunities();
  const { 
    clubs, 
    loading: clubsLoading, 
    joinClub, 
    leaveClub, 
    createClub 
  } = useClubs();

  const [userCommunity, setUserCommunity] = useState<any>(null);

  useEffect(() => {
    const fetchUserCommunity = async () => {
      const community = await getUserCommunity();
      setUserCommunity(community);
      if (community) {
        setSelectedCommunity(community);
      }
    };
    fetchUserCommunity();
  }, [getUserCommunity]);

  const handleJoinCommunity = async (communityId: string) => {
    try {
      await joinCommunity(communityId);
      toast({
        title: "Success!",
        description: "You've joined the community successfully.",
      });
      // Refresh user community
      const community = await getUserCommunity();
      setUserCommunity(community);
      if (community) {
        setSelectedCommunity(community);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to join community.",
        variant: "destructive"
      });
    }
  };

  const handleLeaveCommunity = async (communityId: string) => {
    try {
      await leaveCommunity(communityId);
      toast({
        title: "Success!",
        description: "You've left the community.",
      });
      setUserCommunity(null);
      setSelectedCommunity(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to leave community.",
        variant: "destructive"
      });
    }
  };

  const handleJoinClub = async (clubId: string) => {
    try {
      await joinClub(clubId);
      toast({
        title: "Success!",
        description: "You've joined the club successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to join club.",
        variant: "destructive"
      });
    }
  };

  const handleLeaveClub = async (clubId: string) => {
    try {
      await leaveClub(clubId);
      toast({
        title: "Success!",
        description: "You've left the club.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to leave club.",
        variant: "destructive"
      });
    }
  };

  const handleCreateClub = async () => {
    if (!newClubName.trim() || !selectedCommunity) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!userProfile) {
      toast({
        title: "Error",
        description: "Please login to create a club.",
        variant: "destructive"
      });
      return;
    }

    try {
      setCreatingClub(true);
      await createClub(newClubName, newClubDescription, selectedCommunity.id);
      toast({
        title: "Success!",
        description: "Club created successfully!",
      });
      setShowCreateClub(false);
      setNewClubName('');
      setNewClubDescription('');
    } catch (error: any) {
      console.error('Error creating club:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create club. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCreatingClub(false);
    }
  };

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.college_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClubs = selectedCommunity ? clubs.filter(club =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const renderCommunityCard = (community: any) => (
    <Card key={community.id} className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-blue-500/10 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
              {community.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-xl text-white font-bold">{community.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300 font-medium">{community.college_name}</span>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs font-semibold bg-blue-900/30 text-blue-300 border-blue-700">
            {community.member_count || 0} members
          </Badge>
        </div>
        {community.description && (
          <CardDescription className="text-slate-300 mt-3 text-sm leading-relaxed">
            {community.description}
          </CardDescription>
        )}
        
        {/* Additional Community Info */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-slate-300 font-medium">Active Community</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MessageCircle className="w-4 h-4 text-green-400" />
            <span className="text-slate-300 font-medium">Chat Available</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">Created {new Date(community.created_at).toLocaleDateString()}</span>
          </div>
          {userCommunity?.id === community.id ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleLeaveCommunity(community.id)}
              className="text-red-400 border-red-600 hover:bg-red-900/20 font-medium"
            >
              Leave Community
            </Button>
          ) : userCommunity ? (
            <Button variant="outline" size="sm" disabled className="font-medium text-slate-500">
              Already in a Community
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => handleJoinCommunity(community.id)}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Join Community
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderClubCard = (club: any) => (
    <Card key={club.id} className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-green-500/10 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold">
              {club.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-lg text-white font-bold">{club.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300 font-medium">{club.community?.name}</span>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs font-semibold bg-green-900/30 text-green-300 border-green-700">
            {club.member_count || 0} members
          </Badge>
        </div>
        {club.description && (
          <CardDescription className="text-slate-300 mt-3 text-sm leading-relaxed">
            {club.description}
          </CardDescription>
        )}
        
        {/* Additional Club Info */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-green-400" />
            <span className="text-slate-300 font-medium">Active Discussions</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MessageCircle className="w-4 h-4 text-blue-400" />
            <span className="text-slate-300 font-medium">Posts Available</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">Created {new Date(club.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenClubPosts(club.id, club.name)}
              className="text-blue-400 border-blue-600 hover:bg-blue-900/20 font-medium"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Posts
            </Button>
            {club.is_member && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChat(`club-${club.id}`)}
                className="text-purple-400 border-purple-600 hover:bg-purple-900/20 font-medium"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </Button>
            )}
            {club.is_member ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLeaveClub(club.id)}
                className="text-red-400 border-red-600 hover:bg-red-900/20 font-medium"
              >
                Leave Club
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => handleJoinClub(club.id)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Join Club
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Communities & Clubs
        </h1>
        <Building2 className="w-8 h-8 text-blue-400" />
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          placeholder="Search communities and clubs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-700/80 backdrop-blur-sm border-slate-600 shadow-lg rounded-2xl h-12 text-white placeholder:text-slate-400"
        />
      </div>

      <Tabs defaultValue="communities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-slate-700/50 rounded-xl p-1">
          <TabsTrigger 
            value="communities" 
            className="data-[state=active]:bg-slate-600 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 text-slate-200"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Communities
          </TabsTrigger>
          <TabsTrigger 
            value="clubs"
            className="data-[state=active]:bg-slate-600 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 text-slate-200"
          >
            <Users className="w-4 h-4 mr-2" />
            Clubs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="communities" className="space-y-6">
          {userCommunity && (
            <Card className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-2 border-blue-700 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl text-blue-300 flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Your Community
                </CardTitle>
                <CardDescription className="text-blue-400">
                  You can only join one college community
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderCommunityCard(userCommunity)}
              </CardContent>
            </Card>
          )}

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">
                {userCommunity ? 'Other Communities' : 'Available Communities'}
              </h2>
              <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                {filteredCommunities.length} communities
              </Badge>
            </div>

            {communitiesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 shadow-xl shadow-blue-500/10 rounded-2xl">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-16 h-16 rounded-2xl bg-slate-700" />
                        <div className="flex-1">
                          <Skeleton className="h-6 w-32 mb-2 bg-slate-700" />
                          <Skeleton className="h-4 w-24 bg-slate-700" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2 bg-slate-700" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-4 w-20 bg-slate-700" />
                        <Skeleton className="h-8 w-24 bg-slate-700" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredCommunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCommunities.map(renderCommunityCard)}
              </div>
            ) : (
              <Card className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 shadow-xl shadow-blue-500/10 rounded-2xl">
                <CardContent className="text-center py-12">
                  <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Communities Found</h3>
                  <p className="text-slate-300">Try adjusting your search terms</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="clubs" className="space-y-6">
          {selectedCommunity ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-white">
                    Clubs in {selectedCommunity.name}
                  </h2>
                  <p className="text-slate-300">Join multiple clubs and start discussions</p>
                </div>
                <Dialog open={showCreateClub} onOpenChange={setShowCreateClub}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Club
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800/95 backdrop-blur-sm border border-slate-700 shadow-2xl rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl text-white">Create New Club</DialogTitle>
                      <DialogDescription className="text-slate-300">
                        Create a new club in {selectedCommunity.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="club-name" className="text-slate-200">Club Name</Label>
                        <Input
                          id="club-name"
                          placeholder="Enter club name"
                          value={newClubName}
                          onChange={(e) => setNewClubName(e.target.value)}
                          className="mt-1 bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="club-description" className="text-slate-200">Description</Label>
                        <Textarea
                          id="club-description"
                          placeholder="Describe what this club is about"
                          value={newClubDescription}
                          onChange={(e) => setNewClubDescription(e.target.value)}
                          className="mt-1 bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setShowCreateClub(false)}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateClub}
                          disabled={!newClubName.trim() || creatingClub}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                        >
                          {creatingClub ? 'Creating...' : 'Create Club'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {clubsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 shadow-xl shadow-green-500/10 rounded-2xl">
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          <Skeleton className="w-12 h-12 rounded-xl bg-slate-700" />
                          <div className="flex-1">
                            <Skeleton className="h-5 w-24 mb-2 bg-slate-700" />
                            <Skeleton className="h-4 w-20 bg-slate-700" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-full mb-4 bg-slate-700" />
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-4 w-20 bg-slate-700" />
                          <Skeleton className="h-8 w-16 bg-slate-700" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredClubs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredClubs.map(renderClubCard)}
                </div>
              ) : (
                <Card className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 shadow-xl shadow-green-500/10 rounded-2xl">
                  <CardContent className="text-center py-12">
                    <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Clubs Yet</h3>
                    <p className="text-slate-300 mb-4">Be the first to create a club in this community</p>
                    <Button
                      onClick={() => setShowCreateClub(true)}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Club
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 shadow-xl shadow-green-500/10 rounded-2xl">
              <CardContent className="text-center py-12">
                <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Join a Community First</h3>
                <p className="text-slate-300 mb-4">You need to join a community to access clubs</p>
                <Button
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Browse Communities
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Communities;