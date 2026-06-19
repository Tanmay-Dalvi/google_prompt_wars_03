/**
 * React Error Boundary component.
 * Catches JavaScript errors in child component tree and displays fallback UI.
 */
import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to analytics in production
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', { description: error.message });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="min-h-screen bg-[#0a0f0a] flex items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <div className="text-6xl mb-4">🌍</div>
            <h2 className="text-2xl font-bold text-green-400 mb-2">Something went wrong</h2>
            <p className="text-gray-400 mb-6">EcoSense encountered an error. Please refresh the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              aria-label="Reload the page to recover from error"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
