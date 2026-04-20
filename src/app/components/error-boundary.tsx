import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error(error, info.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
          <div className="max-w-md text-center space-y-4">
            <h1 className="text-2xl font-semibold">Something went wrong</h1>
            <p className="text-muted-foreground text-sm">
              Please refresh the page. If the problem continues, contact support.
            </p>
            <button
              type="button"
              className="rounded-full px-4 py-2 bg-black text-white dark:bg-white dark:text-black"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
