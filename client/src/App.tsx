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
  // ULTRA SIMPLE TEST - NO IMPORTS, NO DEPENDENCIES
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'red', 
      color: 'white', 
      padding: '50px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '30px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '50px', marginBottom: '50px' }}>
        🚨 WORKING! 🚨
      </h1>
      
      <div style={{ marginBottom: '50px' }}>
        <h2>REACT IS WORKING!</h2>
        <p>Background: RED</p>
        <p>Text: WHITE</p>
        <p>Font: Arial 30px</p>
      </div>

      <div style={{ marginBottom: '50px' }}>
        <button 
          onClick={() => alert('JAVASCRIPT WORKS!')}
          style={{
            backgroundColor: 'blue',
            color: 'white',
            padding: '20px 40px',
            border: 'none',
            borderRadius: '10px',
            fontSize: '24px',
            marginRight: '20px'
          }}
        >
          TEST JS
        </button>
        
        <button 
          onClick={() => {
            fetch('/api/healthz')
              .then(r => r.text())
              .then(text => alert('API: ' + text))
              .catch(e => alert('ERROR: ' + e.message));
          }}
          style={{
            backgroundColor: 'green',
            color: 'white',
            padding: '20px 40px',
            border: 'none',
            borderRadius: '10px',
            fontSize: '24px'
          }}
        >
          TEST API
        </button>
      </div>

      <div style={{ 
        backgroundColor: 'black', 
        padding: '30px', 
        borderRadius: '10px',
        marginTop: '50px',
        fontSize: '20px'
      }}>
        <h3>STATUS:</h3>
        <p>If you see this RED page, React works!</p>
        <p>If you see black screen, there's a problem!</p>
        <p>Time: {new Date().toLocaleTimeString()}</p>
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
