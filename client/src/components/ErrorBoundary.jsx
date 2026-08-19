import React from 'react';

// App-wide error boundary. Without one, any render-time throw in any
// component unmounts the whole React tree and leaves the user staring at a
// blank white page with no way out. This catches it and shows a plain
// recovery screen with a reload button, and logs the error to the console
// (the only telemetry available until a real error-monitoring service is
// wired up).
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info?.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
        padding: 24, textAlign: 'center', fontFamily: "'Noto Sans KR', sans-serif",
        color: '#16303a', background: '#f4f9f8',
      }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Something went wrong</h1>
        <p style={{ fontSize: 14.5, color: '#64827e', maxWidth: 420, margin: 0 }}>
          The page hit an unexpected error. Reloading usually fixes it — if it
          keeps happening, let your academy's admin know.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            height: 44, padding: '0 22px', border: 'none', borderRadius: 12,
            background: '#2e9d8d', color: '#fff', fontSize: 15, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Reload
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
