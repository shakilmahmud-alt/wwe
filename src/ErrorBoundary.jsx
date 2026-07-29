import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', background: 'white', zIndex: 9999, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          <h1>Site Error Details:</h1>
          <h2>Please copy the text below and send it to the AI assistant:</h2>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', color: '#333', padding: '10px' }}>
            {this.state.error && this.state.error.toString()}
          </pre>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', color: '#333', padding: '10px' }}>
            {this.state.error && this.state.error.stack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
