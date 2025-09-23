import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Edit, 
  Save, 
  Building, 
  GraduationCap, 
  Users,
  Star,
  Crown,
  Heart
} from 'lucide-react';
import { getCurrentUser, profilePics, mockCommunities, mockClubs } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const user = getCurrentUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    age: user?.age || 18,
    college: user?.college || '',
    stream: user?.stream || '',
    profilePic: user?.profilePic || profilePics[0],
    availableForMentorship: user?.availableForMentorship || false
  });
  const { toast } = useToast();

  if (!user) return null;

  const handleSave = () => {
    // Update user data
    user.name = editForm.name;
    user.age = editForm.age;
    user.college = editForm.college;
    user.stream = editForm.stream;
    user.profilePic = editForm.profilePic;
    if (user.role === 'mentor') {
      user.availableForMentorship = editForm.availableForMentorship;
    }

    setIsEditing(false);
    toast({
      title: "Profile Updated!",
      description: "Your profile has been successfully updated",
    });
  };

  const handleCancel = () => {
    setEditForm({
      name: user.name,
      age: user.age,
      college: user.college,
      stream: user.stream,
      profilePic: user.profilePic,
      availableForMentorship: user.availableForMentorship || false
    });
    setIsEditing(false);
  };

  const joinedCommunities = mockCommunities.filter(c => user.joinedCommunities.includes(c.id));
  const joinedClubs = mockClubs.filter(c => user.joinedClubs.includes(c.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">My Profile</h1>
        <Heart className="w-8 h-8 text-pink-400" />
      </div>

      {/* Profile Card */}
      <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-2xl shadow-blue-500/10 rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button onClick={handleCancel} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            {/* Profile Picture */}
            <div className="space-y-4">
              <Avatar className="w-24 h-24 ring-4 ring-blue-200">
                <AvatarImage src={isEditing ? editForm.profilePic : user.profilePic} alt={user.name} />
                <AvatarFallback className="text-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                  {(isEditing ? editForm.name : user.name).slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="space-y-2">
                  <Label className="text-sm text-slate-200">Choose Avatar</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {profilePics.map((pic, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`w-12 h-12 rounded-full border-2 overflow-hidden transition-all ${
                          editForm.profilePic === pic 
                            ? 'border-blue-400 scale-110' 
                            : 'border-slate-600 hover:border-blue-400/50'
                        }`}
                        onClick={() => setEditForm({...editForm, profilePic: pic})}
                      >
                        <img src={pic} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Role and Status */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge 
                  variant={user.role === 'admin' ? 'destructive' : user.role === 'mentor' ? 'default' : 'secondary'}
                  className="text-sm"
                >
                  {user.role === 'admin' && <Crown className="w-4 h-4 mr-1" />}
                  {user.role === 'mentor' && <Star className="w-4 h-4 mr-1" />}
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
                {user.role === 'mentor' && (isEditing ? editForm.availableForMentorship : user.availableForMentorship) && (
                  <Badge variant="outline" className="text-green-400 border-green-600">
                    Available for Mentorship
                  </Badge>
                )}
              </div>
              
              {user.role === 'mentor' && isEditing && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="mentorship-toggle"
                    checked={editForm.availableForMentorship}
                    onCheckedChange={(checked) => 
                      setEditForm({...editForm, availableForMentorship: checked})
                    }
                  />
                  <Label htmlFor="mentorship-toggle" className="text-sm text-slate-200">
                    Available for Mentorship
                  </Label>
                </div>
              )}

              <div className="text-sm text-slate-400">
                <p>Member since: January 2024</p>
                <p>Email: {user.email}</p>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-200">Full Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              ) : (
                <div className="p-2 bg-slate-700/50 rounded border border-slate-600 text-slate-200">{user.name}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="age" className="text-slate-200">Age</Label>
              {isEditing ? (
                <Input
                  id="age"
                  type="number"
                  value={editForm.age}
                  onChange={(e) => setEditForm({...editForm, age: parseInt(e.target.value)})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              ) : (
                <div className="p-2 bg-slate-700/50 rounded border border-slate-600 text-slate-200">{user.age}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="college" className="text-slate-200">College</Label>
              {isEditing ? (
                <Input
                  id="college"
                  value={editForm.college}
                  onChange={(e) => setEditForm({...editForm, college: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              ) : (
                <div className="p-2 bg-slate-700/50 rounded border border-slate-600 text-slate-200">{user.college}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stream" className="text-slate-200">Stream</Label>
              {isEditing ? (
                <Input
                  id="stream"
                  value={editForm.stream}
                  onChange={(e) => setEditForm({...editForm, stream: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              ) : (
                <div className="p-2 bg-slate-700/50 rounded border border-slate-600 text-slate-200">{user.stream}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-blue-500/10 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Communities</CardTitle>
            <Building className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{joinedCommunities.length}</div>
            <p className="text-xs text-slate-400">Active memberships</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-green-500/10 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Clubs</CardTitle>
            <Users className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{joinedClubs.length}</div>
            <p className="text-xs text-slate-400">Club memberships</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-purple-500/10 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              {user.role === 'mentor' ? 'Mentees' : 'Mentors'}
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{user.connectedMentors.length}</div>
            <p className="text-xs text-slate-400">Active connections</p>
          </CardContent>
        </Card>
      </div>

      {/* Joined Communities */}
      <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-blue-500/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white">My Communities</CardTitle>
          <CardDescription className="text-slate-300">Communities you're part of</CardDescription>
        </CardHeader>
        <CardContent>
          {joinedCommunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {joinedCommunities.map((community) => (
                <div key={community.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-600 bg-slate-700/50">
                  <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{community.name}</h4>
                    <p className="text-sm text-slate-300">{community.memberCount} members</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>You haven't joined any communities yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Joined Clubs */}
      <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl shadow-green-500/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white">My Clubs</CardTitle>
          <CardDescription className="text-slate-300">Clubs you're active in</CardDescription>
        </CardHeader>
        <CardContent>
          {joinedClubs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {joinedClubs.map((club) => (
                <div key={club.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-600 bg-slate-700/50">
                  <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{club.name}</h4>
                    <p className="text-sm text-slate-300">{club.memberCount} members</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>You haven't joined any clubs yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;