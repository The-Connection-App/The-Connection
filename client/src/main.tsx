import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { initGA } from "./lib/analytics";
import { ThemeProvider } from "./contexts/theme-context";
import App from "./App";
import "./index.css";

// Dev helper: force dark mode in development so palette changes are visible immediately
if (process.env.NODE_ENV !== 'production') {
  try {
    // Add the .dark class to document element so CSS .dark tokens apply during dev
    document.documentElement.classList.add('dark');
  } catch (e) {
    // ignore if document isn't ready yet
  }
}

// Initialize Google Analytics
initGA();

// Global error handling for unhandled promises
window.addEventListener('unhandledrejection', event => {
  console.warn('Unhandled promise rejection:', event.reason);
  // Only prevent default for known safe errors
  if (event.reason && (event.reason.name === 'AbortError' || event.reason.name === 'NetworkError')) {
    event.preventDefault();
  }
});

// Handle DOMExceptions and other errors
window.addEventListener('error', event => {
  if (event.error instanceof DOMException) {
    console.warn('DOMException caught:', event.error.message, event.error.name);
    // Only prevent default for non-critical DOMExceptions
    if (event.error.name === 'AbortError' || event.error.name === 'NetworkError') {
      event.preventDefault();
    }
  }
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="the-connection-ui-theme">
      <App />
    </ThemeProvider>
  </QueryClientProvider>
);
