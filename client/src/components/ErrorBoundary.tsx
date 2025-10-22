import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="p-6 max-w-2xl w-full">
            <h1 className="text-2xl font-bold text-destructive mb-4">Something went wrong</h1>
            <div className="space-y-4">
              <div>
                <h2 className="font-semibold mb-2">Error:</h2>
                <pre className="text-sm bg-muted p-3 rounded overflow-auto">
                  {this.state.error?.toString()}
                </pre>
              </div>
              {this.state.errorInfo && (
                <div>
                  <h2 className="font-semibold mb-2">Component Stack:</h2>
                  <pre className="text-sm bg-muted p-3 rounded overflow-auto max-h-64">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Reload App
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
