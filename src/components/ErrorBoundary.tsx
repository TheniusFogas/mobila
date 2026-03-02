'use client';

import React from 'react';

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    ErrorBoundaryState
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({ error, errorInfo });
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    position: 'fixed', inset: 0, background: '#000',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'monospace', color: '#fff', padding: '2rem'
                }}>
                    <div style={{ maxWidth: '600px' }}>
                        <h1 style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '1.2rem' }}>
                            ⚠ Runtime Error (visible for debugging)
                        </h1>
                        <pre style={{
                            background: '#111', padding: '1rem', borderRadius: '8px',
                            overflow: 'auto', fontSize: '0.75rem', color: '#fca5a5',
                            maxHeight: '400px', border: '1px solid #333'
                        }}>
                            {this.state.error?.toString()}
                            {'\n\n'}
                            {this.state.errorInfo?.componentStack}
                        </pre>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
