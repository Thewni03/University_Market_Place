import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', background: '#ffebee', color: '#c62828', fontFamily: 'monospace', minHeight: '100vh' }}>
          <h1>💥 React Application Crashed 💥</h1>
          <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Please send a screenshot of this error text so I can instantly fix it:</p>
          <div style={{ background: '#b71c1c', color: 'white', padding: '1rem', borderRadius: '8px', 
                        whiteSpace: 'pre-wrap', overflowX: 'auto', marginTop: '1rem' }}>
            {this.state.error && this.state.error.toString()}
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
