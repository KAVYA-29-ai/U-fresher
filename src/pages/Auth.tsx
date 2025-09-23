import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Heart, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { profilePics, setCurrentUser, type User } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { authHelpers, supabase } from '@/lib/supabase';
import { config } from '@/lib/config';

interface AuthProps {
  onBack: () => void;
  onAuthSuccess: (user: User) => void;
}

const Auth = ({ onBack, onAuthSuccess }: AuthProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedTab, setSelectedTab] = useState('login');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { toast } = useToast();

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    adminCode: ''
  });

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    role: '' as 'junior' | 'mentor' | 'admin',
    age: '',
    college: '',
    stream: '',
    profilePic: profilePics[0],
    adminCode: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // First, try to sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Check admin code if provided
        let userRole = 'junior'; // default role
        
        if (loginForm.adminCode) {
          if (loginForm.adminCode === config.admin.code) {
            userRole = 'admin';
          } else {
            throw new Error('Invalid admin code. Please check your admin code or leave it empty for regular user access.');
          }
        }

        // Get or create user profile
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
          // User profile doesn't exist, create it
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
              email: data.user.email || '',
              role: userRole as 'admin' | 'mentor' | 'junior',
              profile_pic: data.user.user_metadata?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
              age: 18,
              college: '',
              stream: '',
              available_for_mentorship: false
            });

          if (insertError) {
            console.error('Error creating user profile:', insertError);
          }
        } else if (profileError) {
          console.error('Error fetching user profile:', profileError);
        } else if (profile && loginForm.adminCode && userRole === 'admin') {
          // Update existing user profile to admin if admin code is provided
          const { error: updateError } = await supabase
            .from('users')
            .update({ role: 'admin' })
            .eq('id', data.user.id);

          if (updateError) {
            console.error('Error updating user role:', updateError);
          }
        }

        // Update user metadata with role if admin code was provided
        if (loginForm.adminCode && userRole === 'admin') {
          await supabase.auth.updateUser({
            data: { role: 'admin' }
          });
        }

        // Convert to our User interface
        const user: User = {
          id: data.user.id,
          name: profile?.name || data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email || '',
          role: (profile?.role || userRole) as 'admin' | 'mentor' | 'junior',
          profilePic: profile?.profile_pic || data.user.user_metadata?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
          age: profile?.age || 18,
          college: profile?.college || '',
          stream: profile?.stream || '',
          joinedCommunities: [],
          joinedClubs: [],
          connectedMentors: []
        };

        setCurrentUser(user);
        setSuccess(`Welcome back! Logged in as ${user.name} (${user.role})`);
        
        toast({
          title: "Welcome back!",
          description: `Logged in as ${user.name} (${user.role})`,
        });

        // Redirect based on role
        setTimeout(() => {
          onAuthSuccess(user);
        }, 1000);
      }
    } catch (error: any) {
      const errorMessage = error.message || "Login failed. Please check your credentials.";
      setError(errorMessage);
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      const errorMessage = error.message || "Google login failed. Please try again.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.role) {
      toast({
        title: "Please select a role",
        description: "Choose whether you're a Junior, Mentor, or Admin",
        variant: "destructive"
      });
      return;
    }

    // Check admin code if role is admin
    if (registerForm.role === 'admin' && registerForm.adminCode !== config.admin.code) {
      setError('Invalid admin code. Please enter the correct admin code to register as admin.');
      toast({
        title: "Invalid Admin Code",
        description: "Please enter the correct admin code to register as admin",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: registerForm.email,
        password: registerForm.password,
        options: {
          data: {
            name: registerForm.name,
            role: registerForm.role,
            profile_pic: registerForm.profilePic,
            age: parseInt(registerForm.age),
            college: registerForm.college,
            stream: registerForm.stream
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        setSuccess("Account created successfully! Please check your email to verify your account.");
      toast({
        title: "Welcome to U-fresher!",
          description: "Account created successfully! Please check your email to verify your account.",
      });
      }
    } catch (error: any) {
      const errorMessage = error.message || "Registration failed. Please try again.";
      setError(errorMessage);
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 text-slate-300 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent flex items-center justify-center gap-2">
            U-fresher <Heart className="h-8 w-8 text-pink-400" />
          </h1>
          <p className="text-slate-300">Join your college community today</p>
        </div>

        {/* Auth Tabs */}
        <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-2xl shadow-blue-500/10 rounded-2xl">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-2 bg-slate-700/50 rounded-xl p-1">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-slate-600 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 text-slate-200"
              >
                Login
              </TabsTrigger>
              <TabsTrigger 
                value="register"
                className="data-[state=active]:bg-slate-600 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 text-slate-200"
              >
                Register
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <CardHeader>
                <CardTitle className="text-white">Welcome Back</CardTitle>
                <CardDescription className="text-slate-300">
                  Sign in to your account to continue
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Error/Success Messages */}
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-200">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                      required
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-200">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                        required
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 pr-10 bg-slate-700 border-slate-600 text-white"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-slate-400"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminCode" className="text-slate-200">Admin Code (Optional)</Label>
                    <Input
                      id="adminCode"
                      type="password"
                      placeholder="Enter admin code for admin access"
                      value={loginForm.adminCode}
                      onChange={(e) => setLoginForm({...loginForm, adminCode: e.target.value})}
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 bg-slate-700 border-slate-600 text-white"
                    />
                    <p className="text-xs text-slate-400">
                      Use your admin code for admin access
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Signing in...
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-600" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-slate-800 px-2 text-slate-400">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-2 border-slate-600 hover:border-slate-500 hover:bg-slate-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-slate-200"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google Sign In
                    </div>
                  </Button>

                </form>
              </CardContent>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <CardHeader>
                <CardTitle className="text-white">Create Account</CardTitle>
                <CardDescription className="text-slate-300">
                  Join the U-fresher community
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Error/Success Messages */}
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-200">Name</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                        required
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age" className="text-slate-200">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="18"
                        value={registerForm.age}
                        onChange={(e) => setRegisterForm({...registerForm, age: e.target.value})}
                        required
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-email" className="text-slate-200">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="your@email.com"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                      required
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-slate-200">Role</Label>
                    <Select value={registerForm.role} onValueChange={(value: 'junior' | 'mentor' | 'admin') => setRegisterForm({...registerForm, role: value})}>
                      <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="junior" className="text-white hover:bg-slate-600">Junior (Student)</SelectItem>
                        <SelectItem value="mentor" className="text-white hover:bg-slate-600">Mentor (Senior/Alumni)</SelectItem>
                        <SelectItem value="admin" className="text-white hover:bg-slate-600">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {registerForm.role === 'admin' && (
                    <div className="space-y-2">
                      <Label htmlFor="adminCode" className="text-slate-200">Admin Code</Label>
                      <Input
                        id="adminCode"
                        type="password"
                        placeholder="Enter admin code"
                        value={registerForm.adminCode}
                        onChange={(e) => setRegisterForm({...registerForm, adminCode: e.target.value})}
                        required
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 bg-slate-700 border-slate-600 text-white"
                      />
                      <p className="text-xs text-slate-400">
                        Contact administrator for admin code
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="college" className="text-slate-200">College</Label>
                      <Input
                        id="college"
                        placeholder="Your college"
                        value={registerForm.college}
                        onChange={(e) => setRegisterForm({...registerForm, college: e.target.value})}
                        required
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stream" className="text-slate-200">Stream</Label>
                      <Input
                        id="stream"
                        placeholder="Computer Science"
                        value={registerForm.stream}
                        onChange={(e) => setRegisterForm({...registerForm, stream: e.target.value})}
                        required
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-200">Profile Picture</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {profilePics.map((pic, index) => (
                        <button
                          key={index}
                          type="button"
                          className={`w-12 h-12 rounded-full border-2 overflow-hidden transition-all duration-200 hover:scale-110 ${
                            registerForm.profilePic === pic 
                              ? 'border-blue-400 ring-2 ring-blue-300' 
                              : 'border-slate-600 hover:border-slate-500'
                          }`}
                          onClick={() => setRegisterForm({...registerForm, profilePic: pic})}
                        >
                          <img src={pic} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-password" className="text-slate-200">Password</Label>
                    <div className="relative">
                      <Input
                        id="reg-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                        required
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 pr-10 bg-slate-700 border-slate-600 text-white"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-slate-400"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating Account...
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;