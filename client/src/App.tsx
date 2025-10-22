import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import { useEffect } from "react";
import { useLocation } from "wouter";
import { showBackButton, hideBackButton, canGoBack } from "@/lib/telegram";

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

export default function App() {
  const [location, navigate] = useLocation();

  // Initialize Telegram WebApp
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
  }

  // Handle Telegram back button
  useEffect(() => {
    if (location === '/' || location === '') {
      // Hide back button on dashboard
      hideBackButton();
    } else if (canGoBack()) {
      // Show back button on other pages
      showBackButton(() => {
        navigate('/');
      });
    }

    // Cleanup on unmount
    return () => {
      hideBackButton();
    };
  }, [location, navigate]);

  return (
    <TonConnectUIProvider manifestUrl="https://crypto-hacker-heist.onrender.com/tonconnect-manifest.json">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
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
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </TonConnectUIProvider>
  );
}