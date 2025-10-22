import { Switch, Route } from "wouter";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery, useMutation } from "@tanstack/react-query";
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Tutorial } from "@/components/Tutorial";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import MobileHeader from "@/components/MobileHeader";
import ErrorBoundary from "@/components/ErrorBoundary";
import Dashboard from "@/pages/Dashboard";
import WalletPage from "@/pages/Wallet";
import Rigs from "@/pages/Rigs";
import Shop from "@/pages/Shop";
import BlockExplorer from "@/pages/BlockExplorer";
import Referrals from "@/pages/Referrals";
import Challenges from "@/pages/Challenges";
import Achievements from "@/pages/Achievements";
import Cosmetics from "@/pages/Cosmetics";
import Statistics from "@/pages/Statistics";
import SpinWheel from "@/pages/SpinWheel";
import Admin from "@/pages/Admin";
import Packs from "@/pages/Packs";
import Subscription from "@/pages/Subscription";
import Leaderboard from "@/pages/Leaderboard";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import NotFound from "@/pages/not-found";
import { initializeUser } from "@/lib/user";
import { apiRequest } from "@/lib/queryClient";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/wallet" component={WalletPage} />
      <Route path="/rigs" component={Rigs} />
      <Route path="/shop" component={Shop} />
      <Route path="/blocks" component={BlockExplorer} />
      <Route path="/referrals" component={Referrals} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/challenges" component={Challenges} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/cosmetics" component={Cosmetics} />
      <Route path="/packs" component={Packs} />
      <Route path="/subscription" component={Subscription} />
      <Route path="/statistics" component={Statistics} />
      <Route path="/spin" component={SpinWheel} />
      <Route path="/admin" component={Admin} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [userInitLoading, setUserInitLoading] = useState(true);
  const [userInitError, setUserInitError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      setUserInitLoading(true);
      
      // Check backend health first
      try {
        const healthResponse = await fetch('/api/health');
        const healthData = await healthResponse.json();
        
        if (healthData.status === 'degraded') {
          setUserInitError("Service is temporarily unavailable. Please try again in a few minutes.");
          setUserInitLoading(false);
          return;
        }
      } catch (error) {
        // Health check failed, but could be client network issue
        // Proceed anyway and let user init handle the error
        console.warn('Health check failed, proceeding with initialization:', error);
      }
      
      // Initialize user
      try {
        const id = await initializeUser();
        setUserId(id);
        setUserInitLoading(false);
        setUserInitError(null);
      } catch (err: any) {
        console.error('Failed to initialize user:', err);
        setUserInitError(err.message || "Failed to initialize. Please try again.");
        setUserInitLoading(false);
      }
    };
    
    initializeApp();
  }, []);

  const { data: userProfile } = useQuery({
    queryKey: ['/api/user', userId],
    enabled: !!userId,
  });

  // Show tutorial if user hasn't completed it
  useEffect(() => {
    if (userProfile && !userProfile.tutorialCompleted && !tutorialOpen) {
      const timer = setTimeout(() => {
        setTutorialOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [userProfile, tutorialOpen]);

  const completeTutorialMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/user/${userId}/tutorial/complete`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId] });
      setTutorialOpen(false);
      toast({
        title: "🎉 Tutorial Complete!",
        description: data.message || "You earned 5,000 CS! Start mining now!",
      });
    },
    onError: (error: any) => {
      console.error("Tutorial completion error:", error);
      setTutorialOpen(false);
    },
  });

  const handleTutorialComplete = () => {
    completeTutorialMutation.mutate();
  };

  const handleTutorialSkip = () => {
    completeTutorialMutation.mutate();
  };

  // Loading UI
  if (userInitLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  // Error UI
  if (userInitError) {
    const isNotInTelegram = userInitError.includes("Please open this app in Telegram");
    
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">
            !
          </div>
          <h1 className="text-xl font-bold mb-2">Initialization Failed</h1>
          <p className="text-sm text-muted-foreground mb-4">{userInitError}</p>
          <div className="space-y-2">
            {!isNotInTelegram && (
              <button
                onClick={() => {
                  setUserInitError(null);
                  setUserInitLoading(true);
                  initializeUser()
                    .then((id) => {
                      setUserId(id);
                      setUserInitLoading(false);
                      setUserInitError(null);
                    })
                    .catch((err) => {
                      console.error('Failed to initialize user:', err);
                      setUserInitError(err.message || "Failed to initialize. Please try again.");
                      setUserInitLoading(false);
                    });
                }}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Retry
              </button>
            )}
            {isNotInTelegram && window.Telegram?.WebApp && (
              <button
                onClick={() => {
                  if (window.Telegram?.WebApp?.openTelegramLink) {
                    const botUsername = import.meta.env.VITE_BOT_USERNAME || 'cryptohackerheist_bot';
                    window.Telegram.WebApp.openTelegramLink(`https://t.me/${botUsername}`);
                  }
                }}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Open in Telegram
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-screen w-full bg-background">
        <MobileHeader user={userProfile} />
        <main className="flex-1 overflow-auto pb-16">
          <ErrorBoundary>
            <Router />
          </ErrorBoundary>
        </main>
        <BottomNav />
      </div>
      
      <Tutorial
        open={tutorialOpen}
        onComplete={handleTutorialComplete}
        onSkip={handleTutorialSkip}
      />
      
      <Toaster />
    </>
  );
}

export default function App() {
  // Initialize Telegram WebApp
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  const manifestUrl = import.meta.env.VITE_TON_MANIFEST_URL || "https://crypto-hacker-heist.onrender.com/tonconnect-manifest.json";

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AppContent />
        </TooltipProvider>
      </QueryClientProvider>
    </TonConnectUIProvider>
  );
}