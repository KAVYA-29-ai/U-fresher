import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import ClubPosts from "./pages/ClubPosts";
import { useAuth } from "./hooks/useAuth";
import { supabase } from "./lib/supabase";

const queryClient = new QueryClient();

const App = () => {
  const [currentView, setCurrentView] = useState<'home' | 'auth' | 'auth-callback' | 'dashboard' | 'club-posts'>('home');
  const [selectedClub, setSelectedClub] = useState<{id: string, name: string} | null>(null);
  const { user, loading, isAuthenticated } = useAuth();

  // Handle URL-based routing
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      
      if (path === '/auth/callback') {
        setCurrentView('auth-callback');
      } else if (isAuthenticated && user) {
        setCurrentView('dashboard');
      } else if (path === '/auth') {
        setCurrentView('auth');
      } else if (path.startsWith('/clubs/')) {
        // Handle club posts route
        const clubId = path.split('/clubs/')[1];
        if (clubId && isAuthenticated && user) {
          setCurrentView('club-posts');
          setSelectedClub({ id: clubId, name: 'Club' });
        } else {
          setCurrentView('home');
        }
      } else {
        setCurrentView('home');
      }
    };

    handleRouteChange();
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [isAuthenticated, user]);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && user && currentView === 'home') {
      setCurrentView('dashboard');
    }
  }, [isAuthenticated, user, currentView]);

  const handleGetStarted = () => {
    setCurrentView('auth');
    window.history.pushState({}, '', '/auth');
  };

  const handleAuthSuccess = (user: any) => {
    // Redirect based on user role
    setCurrentView('dashboard');
    window.history.pushState({}, '', '/dashboard');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setCurrentView('home');
    window.history.pushState({}, '', '/');
  };

  const handleBack = () => {
    setCurrentView('home');
    window.history.pushState({}, '', '/');
  };

  const handleAuthCallback = (user: any) => {
    setCurrentView('dashboard');
    window.history.pushState({}, '', '/dashboard');
  };

  const handleAuthError = (error: string) => {
    console.error('Auth error:', error);
    setCurrentView('auth');
    window.history.pushState({}, '', '/auth');
  };

  const handleOpenClubPosts = (clubId: string, clubName: string) => {
    setSelectedClub({ id: clubId, name: clubName });
    setCurrentView('club-posts');
    window.history.pushState({}, '', `/clubs/${clubId}`);
  };

  const handleBackToDashboard = () => {
    setSelectedClub(null);
    setCurrentView('dashboard');
    window.history.pushState({}, '', '/dashboard');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="min-h-screen">
          {loading ? (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-300">Loading U-Fresher...</p>
              </div>
            </div>
          ) : (
            <>
              {currentView === 'home' && <Home onGetStarted={handleGetStarted} />}
              {currentView === 'auth' && <Auth onBack={handleBack} onAuthSuccess={handleAuthSuccess} />}
              {currentView === 'auth-callback' && <AuthCallback onAuthSuccess={handleAuthCallback} onAuthError={handleAuthError} />}
              {currentView === 'dashboard' && user && (
                <Dashboard 
                  onLogout={handleLogout} 
                  onOpenClubPosts={handleOpenClubPosts}
                />
              )}
              {currentView === 'club-posts' && selectedClub && (
                <ClubPosts 
                  clubId={selectedClub.id}
                  clubName={selectedClub.name}
                  onBack={handleBackToDashboard}
                />
              )}
            </>
          )}
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;