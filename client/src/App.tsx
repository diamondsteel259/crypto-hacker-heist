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
  // SUPER SIMPLE TEST - NO TELEGRAM CHECKS
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#000', 
      color: '#fff', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>
        🚨 EMERGENCY TEST PAGE 🚨
      </h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>If you see this, React is working!</h2>
        <p>Background: BLACK</p>
        <p>Text: WHITE</p>
        <p>Font: Arial</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => alert('JAVASCRIPT WORKS!')}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            marginRight: '10px'
          }}
        >
          TEST JAVASCRIPT
        </button>
        
        <button 
          onClick={() => {
            fetch('/api/healthz')
              .then(r => r.text())
              .then(text => alert('API WORKS: ' + text))
              .catch(e => alert('API ERROR: ' + e.message));
          }}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px'
          }}
        >
          TEST API
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Telegram Info:</h3>
        <p>WebApp Available: {window.Telegram?.WebApp ? 'YES' : 'NO'}</p>
        <p>InitData Available: {window.Telegram?.WebApp?.initData ? 'YES' : 'NO'}</p>
        <p>User Agent: {navigator.userAgent}</p>
      </div>

      <div style={{ 
        backgroundColor: '#333', 
        padding: '15px', 
        borderRadius: '5px',
        marginTop: '20px'
      }}>
        <h3>What to do:</h3>
        <p>1. If you see this page: React works, issue is in main app</p>
        <p>2. If you see black screen: There's a deeper problem</p>
        <p>3. Test the buttons above</p>
        <p>4. Tell me what happens!</p>
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
