"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex-1 flex items-center justify-center bg-[var(--bg-void)]">
            <div className="rounded-2xl px-10 py-8 text-center max-w-md bg-[var(--bg-panel)] border border-[var(--border)] shadow-lg">
              <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-[var(--red)]/10 border border-[var(--red)]/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-[var(--red)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
              <div className="text-[10px] font-bold font-mono text-[var(--red)] uppercase tracking-[0.2em] mb-1">Runtime Error</div>
              <p className="text-[11px] font-mono text-[var(--text-secondary)] mb-3">{this.state.error?.message ?? "An unexpected error occurred"}</p>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white bg-[var(--cyan)] hover:opacity-90 rounded transition-all"
              >
                Retry
              </button>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
