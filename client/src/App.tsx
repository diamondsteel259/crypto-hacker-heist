import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import BottomNav from "@/components/BottomNav";
import MobileHeader from "@/components/MobileHeader";
import Dashboard from "@/pages/Dashboard";
import WalletPage from "@/pages/Wallet";
import Rigs from "@/pages/Rigs";
import Shop from "@/pages/Shop";
import BlockExplorer from "@/pages/BlockExplorer";
import Referrals from "@/pages/Referrals";
import LootBoxes from "@/pages/LootBoxes";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/wallet" component={WalletPage} />
      <Route path="/rigs" component={Rigs} />
      <Route path="/shop" component={Shop} />
      <Route path="/blocks" component={BlockExplorer} />
      <Route path="/referrals" component={Referrals} />
      <Route path="/lootboxes" component={LootBoxes} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  // Initialize Telegram WebApp
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
  }

  // Only render the app when inside Telegram or when explicitly allowed via debug flag
  const isTelegram = Boolean(window.Telegram?.WebApp?.initData);
  const manifestUrl = `${window.location.origin}/tonconnect-manifest.json`;

  if (!isTelegram) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-xl font-bold mb-2">Open in Telegram</h1>
          <p className="text-sm text-muted-foreground">This mini app must be opened from the Telegram client.</p>
        </div>
      </div>
    );
  }

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              {/* Desktop Sidebar - hidden on mobile */}
              <div className="hidden md:block">
                <AppSidebar />
              </div>
              
              <div className="flex flex-col flex-1 min-w-0">
                {/* Desktop Header - hidden on mobile */}
                <header className="hidden md:flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                </header>
                
                {/* Mobile Header - shown only on mobile */}
                <MobileHeader />
                
                {/* Main Content - with bottom padding on mobile for nav */}
                <main className="flex-1 overflow-auto pb-14 md:pb-0">
                  <Router />
                </main>
                
                {/* Mobile Bottom Navigation - shown only on mobile */}
                <BottomNav />
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </TonConnectUIProvider>
  );
}
