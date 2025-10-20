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
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";
import { Component, ReactNode } from "react";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 text-center bg-background">
          <div>
            <h1 className="text-xl font-bold mb-2 text-destructive">App Error</h1>
            <p className="text-sm text-muted-foreground mb-4">
              Something went wrong. Please refresh the page.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            >
              Refresh Page
            </button>
            {this.state.error && (
              <details className="mt-4 text-xs text-muted-foreground">
                <summary>Error Details</summary>
                <pre className="mt-2 text-left">{this.state.error.message}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/wallet" component={WalletPage} />
      <Route path="/rigs" component={Rigs} />
      <Route path="/shop" component={Shop} />
      <Route path="/blocks" component={BlockExplorer} />
      <Route path="/referrals" component={Referrals} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  // Initialize Telegram WebApp
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
  }

  // Debug Telegram WebApp availability
  console.log('Telegram WebApp available:', !!window.Telegram?.WebApp);
  console.log('Telegram initData available:', !!window.Telegram?.WebApp?.initData);
  console.log('User agent:', navigator.userAgent);

  // Only render the app when inside Telegram
  const isTelegram = Boolean(window.Telegram?.WebApp?.initData);
  const manifestUrl = `${window.location.origin}/tonconnect-manifest.json`;

  if (!isTelegram) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-background">
        <div>
          <h1 className="text-xl font-bold mb-2">Open in Telegram</h1>
          <p className="text-sm text-muted-foreground mb-4">This mini app must be opened from the Telegram client.</p>
          <div className="text-xs text-muted-foreground">
            <p>Debug info:</p>
            <p>Telegram WebApp: {window.Telegram?.WebApp ? 'Available' : 'Not available'}</p>
            <p>InitData: {window.Telegram?.WebApp?.initData ? 'Available' : 'Not available'}</p>
          </div>
        </div>
      </div>
    );
  }

  // TEMPORARY: Show diagnostic info instead of the app
  return (
    <div className="min-h-screen bg-background p-4">
      <h1 className="text-2xl font-bold mb-4">🔧 DIAGNOSTIC MODE</h1>
      
      <div className="space-y-4">
        <div className="bg-card p-4 rounded-lg">
          <h2 className="font-bold mb-2">Telegram WebApp Status:</h2>
          <p>Available: {window.Telegram?.WebApp ? '✅ YES' : '❌ NO'}</p>
          <p>InitData: {window.Telegram?.WebApp?.initData ? '✅ YES' : '❌ NO'}</p>
          <p>User Agent: {navigator.userAgent}</p>
        </div>

        <div className="bg-card p-4 rounded-lg">
          <h2 className="font-bold mb-2">App Status:</h2>
          <p>React App: ✅ LOADED</p>
          <p>Error Boundary: ✅ ACTIVE</p>
          <p>Background: ✅ SET</p>
        </div>

        <div className="bg-card p-4 rounded-lg">
          <h2 className="font-bold mb-2">Test Components:</h2>
          <button 
            onClick={() => alert('Button works!')}
            className="bg-primary text-primary-foreground px-4 py-2 rounded mr-2"
          >
            Test Button
          </button>
          <button 
            onClick={() => {
              try {
                fetch('/api/healthz').then(r => r.text()).then(alert);
              } catch (e) {
                alert('Fetch error: ' + e);
              }
            }}
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded"
          >
            Test API
          </button>
        </div>

        <div className="bg-card p-4 rounded-lg">
          <h2 className="font-bold mb-2">Next Steps:</h2>
          <p>1. If you see this page, React is working</p>
          <p>2. Test the buttons above</p>
          <p>3. If buttons work, the issue is in the main app components</p>
          <p>4. If buttons don't work, there's a deeper issue</p>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <TonConnectUIProvider manifestUrl={manifestUrl}>
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
    </ErrorBoundary>
  );
}
