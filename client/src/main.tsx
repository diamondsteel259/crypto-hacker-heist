import { createRoot } from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";

try {
  createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
  
  // Remove initial loader after successful render
  document.getElementById('initial-loader')?.remove();
} catch (error) {
  console.error('Critical error loading app:', error);
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div>
          <div style="width: 48px; height: 48px; background: #ff3b30; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: white; font-size: 24px;">!</div>
          <h1 style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">Critical error loading app</h1>
          <p style="color: #666; margin-bottom: 16px;">Please refresh the page to try again.</p>
          <button onclick="window.location.reload()" style="padding: 10px 20px; background: #0088cc; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">Refresh Page</button>
        </div>
      </div>
    `;
  }
}