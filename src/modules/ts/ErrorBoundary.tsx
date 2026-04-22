import React from 'react';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    message: string;
}

class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, message: '' };
    }

    static getDerivedStateFromError(error: unknown): State {
        const message = error instanceof Error ? error.message : String(error);
        return { hasError: true, message };
    }

    componentDidCatch(error: unknown, info: React.ErrorInfo) {
        console.error('ErrorBoundary caught:', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="alert alert-danger m-3" role="alert">
                    <strong>Something went wrong.</strong> {this.state.message}
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
