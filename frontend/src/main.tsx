import React, { Component, ErrorInfo, ReactNode } from "react";
import ReactDOM from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { App } from "./App";
import "./styles/index.css";

type ErrorBoundaryState = { hasError: boolean };

class StartupErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("VeriSight failed while rendering:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen grid place-items-center bg-[#070b14] p-6 text-slate-100">
          <section className="max-w-lg rounded-xl border border-rose-900 bg-slate-900 p-6 shadow-2xl">
            <h1 className="text-lg font-semibold">VeriSight could not load</h1>
            <p className="mt-2 text-sm text-slate-300">
              The workbench encountered an error while starting. Reload the page to try again.
            </p>
            <button
              className="mt-5 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
              onClick={() => window.location.reload()}
            >
              Reload VeriSight
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StartupErrorBoundary>
      <App />
      <Analytics />
      <SpeedInsights />
    </StartupErrorBoundary>
  </React.StrictMode>,
);
