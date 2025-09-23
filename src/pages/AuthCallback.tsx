import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { setCurrentUser, type User } from '@/lib/mockData';

interface AuthCallbackProps {
  onAuthSuccess: (user: User) => void;
  onAuthError?: (error: string) => void;
}

const AuthCallback = ({ onAuthSuccess, onAuthError }: AuthCallbackProps) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the auth callback from URL hash/fragment
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setError(error.message);
          if (onAuthError) {
            onAuthError(error.message);
          }
          return;
        }

        if (data.session?.user) {
          // Get user profile from database
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          // Convert Supabase user to our User interface
          const user: User = {
            id: data.session.user.id,
            name: profile?.name || data.session.user.user_metadata?.name || data.session.user.email?.split('@')[0] || 'User',
            email: data.session.user.email || '',
            role: profile?.role || data.session.user.user_metadata?.role || 'junior',
            profilePic: profile?.profile_pic || data.session.user.user_metadata?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
            age: profile?.age || 18,
            college: profile?.college || '',
            stream: profile?.stream || '',
            joinedCommunities: [],
            joinedClubs: [],
            connectedMentors: []
          };

          setCurrentUser(user);
          onAuthSuccess(user);
        } else {
          setError('No user session found');
          if (onAuthError) {
            onAuthError('No user session found');
          }
        }
      } catch (error: any) {
        console.error('Error handling auth callback:', error);
        setError(error.message || 'Authentication failed');
        if (onAuthError) {
          onAuthError(error.message || 'Authentication failed');
        }
      }
    };

    handleAuthCallback();
  }, [onAuthSuccess, onAuthError]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Authentication Error</h2>
          <p className="text-slate-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-300">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;