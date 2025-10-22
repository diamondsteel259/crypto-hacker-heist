import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App crashed:', error, errorInfo);
  }

  handleReportIssue = () => {
    // Open Telegram support if available
    const botUsername = import.meta.env.VITE_BOT_USERNAME || 'cryptohackerheist_bot';
    if (window.Telegram?.WebApp?.openTelegramLink) {
      // Replace with actual support bot or channel
      window.Telegram.WebApp.openTelegramLink(`https://t.me/${botUsername}`);
    } else if (window.Telegram?.WebApp?.openLink) {
      window.Telegram.WebApp.openLink(`https://t.me/${botUsername}`);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="p-6 max-w-md w-full text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white text-2xl">
                !
              </div>
            </div>
            <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
            <p className="text-sm text-muted-foreground mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Reload App
              </Button>
              {window.Telegram?.WebApp && (
                <Button
                  onClick={this.handleReportIssue}
                  variant="outline"
                  className="w-full"
                >
                  Report Issue
                </Button>
              )}
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
