import { Component, type ErrorInfo, type ReactNode } from 'react';
import type { ErrorBoundaryProps } from '@/shared/types';
import { errorLogger } from '@/shared/lib/error-handling/utils/error-utils';

interface Props {
    children: ReactNode;
    fallbackRender?: (props: ErrorBoundaryProps) => ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        if (import.meta.env.DEV) {
            console.error('Error Boundary:', error, errorInfo);
        }

        errorLogger.logError(error, { errorInfo });

        this.props.onError?.(error, errorInfo);
    }

    resetErrorBoundary = (): void => {
        this.setState({ hasError: false, error: undefined });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallbackRender) {
                return this.props.fallbackRender({
                    error: this.state.error,
                    resetErrorBoundary: this.resetErrorBoundary,
                });
            }
            return <div>Something went wrong.</div>;
        }

        return this.props.children;
    }
}