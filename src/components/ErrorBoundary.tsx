import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    message: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || 'An unexpected application error occurred.' };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught platform error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F1DF] text-[#102D23] p-6">
          <div className="max-w-lg w-full bg-white border border-[#D9AD43]/40 rounded-xl p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#8A6518] mb-2">
              As-Siddique Islamic Academy · Safety Fallback
            </p>
            <h1 className="font-serif text-3xl font-semibold text-[#06452C] mb-3">
              Something needs attention
            </h1>
            <p className="text-sm text-[#314A3F] leading-relaxed mb-5">
              A component encountered an error while loading data. Your session and saved records
              remain safe.
            </p>
            <pre className="text-xs bg-[#F8F1DF] border border-[#E4DDD0] rounded-lg p-3 overflow-x-auto text-[#7F1D1D] mb-5">
              {this.state.message}
            </pre>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 text-sm font-semibold text-[#F8F1DF] bg-[#06452C] hover:bg-[#102D23] rounded-lg transition-colors cursor-pointer"
            >
              Reload Platform
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
