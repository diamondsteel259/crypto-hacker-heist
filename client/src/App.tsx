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
      <Route path="/challenges" component={Challenges} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/cosmetics" component={Cosmetics} />
      <Route path="/packs" component={Packs} />
      <Route path="/subscription" component={Subscription} />
      <Route path="/statistics" component={Statistics} />
      <Route path="/spin" component={SpinWheel} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  useEffect(() => {
    initializeUser()
      .then(setUserId)
      .catch(err => console.error('Failed to initialize user:', err));
  }, []);

  const { data: userProfile } = useQuery({
    queryKey: ['/api/user', userId],
    enabled: !!userId,
  });

  // Show tutorial if user hasn't completed it
  useEffect(() => {
    if (userProfile && !userProfile.tutorialCompleted && !tutorialOpen) {
      // Delay showing tutorial by 1 second to let the app load
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
    // Still mark as completed but user chose to skip
    completeTutorialMutation.mutate();
  };

  return (
    <>
      <div className="flex flex-col h-screen w-full bg-background">
        {/* Mobile Header */}
        <MobileHeader />
        
        {/* Main Content - with bottom padding for nav */}
        <main className="flex-1 overflow-auto pb-16">
          <Router />
        </main>
        
        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
      
      {/* Tutorial Modal */}
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
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
  }

  return (
    <TonConnectUIProvider manifestUrl="https://crypto-hacker-heist.onrender.com/tonconnect-manifest.json">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AppContent />
        </TooltipProvider>
      </QueryClientProvider>
    </TonConnectUIProvider>
  );
}