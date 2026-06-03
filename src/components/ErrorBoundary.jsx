import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console for debugging
    console.error('Error caught by boundary:', error, errorInfo);
    
    // You could also log this to an external service
    // logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false });
    // Reset to login view
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h1>Oops! Something went wrong</h1>
            <p className="error-message">
              The voting system encountered an unexpected error. Don't worry - your data is safe!
            </p>
            
            <div className="error-actions">
              <button 
                onClick={this.handleGoHome}
                className="primary-btn"
              >
                🏠 Go to Home
              </button>
              <button 
                onClick={this.handleReload}
                className="secondary-btn"
              >
                🔄 Reload Page
              </button>
            </div>
            
            <details className="error-details">
              <summary>Technical Details (for admin)</summary>
              <div className="error-info">
                <p><strong>Error:</strong> {this.state.error && this.state.error.toString()}</p>
                <p><strong>Stack Trace:</strong></p>
                <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
              </div>
            </details>
            
            <div className="error-footer">
              <p>If this problem persists, please contact the system administrator.</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
