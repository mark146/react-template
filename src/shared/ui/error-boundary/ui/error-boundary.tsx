import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import type { ErrorBoundaryProps } from '@/shared/types';
import { withErrorBoundaryLogging } from '@/shared/lib/error-handling/utils/logging-helpers';

interface Props {
    children: ReactNode;
    fallbackRender?: (props: ErrorBoundaryProps) => ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    componentName?: string;
    feature?: string;
    maxRetries?: number;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
    errorId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
    private retryCount = 0;
    private maxRetries: number;
    private errorLogger: ReturnType<typeof withErrorBoundaryLogging>;

    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
        this.maxRetries = props.maxRetries || 3;

        this.errorLogger = withErrorBoundaryLogging({
            componentName: props.componentName || 'UnknownComponent',
            feature: props.feature || 'error-boundary',
            maxRetries: this.maxRetries,
        });
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorId: `boundary-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // 모든 에러 관련 정보를 state에 저장
        this.setState({
            hasError: true,
            error,
            errorInfo,
            errorId: `boundary-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });

        this.errorLogger.logError(error, {
            retryCount: this.retryCount,
            props: this.props,
            state: this.state,
            errorInfo: errorInfo
        });

        if (this.props.onError) {
            this.errorLogger.logCustomHandler(() => {
                this.props.onError!(error, errorInfo);
            });
        }
    }

    resetErrorBoundary = (): void => {
        this.retryCount += 1;

        if (this.retryCount > this.maxRetries) {
            this.errorLogger.logMaxRetriesExceeded();
            return;
        }

        this.errorLogger.logRetry(this.retryCount);

        this.setState({
            hasError: false,
            error: undefined,
            errorInfo: undefined,
            errorId: undefined
        });
    };

    componentDidUpdate(_prevProps: Props, prevState: State): void {
        if (prevState.hasError && !this.state.hasError) {
            this.errorLogger.logRecovery();
        }
    }

    handleReload = () => {
        if (typeof window !== 'undefined' && window.location) {
            window.location.reload();
        }
    };

    render(): ReactNode {
        if (this.state.hasError) {
            const canRetry = this.retryCount < this.maxRetries;

            if (this.props.fallbackRender) {
                return this.props.fallbackRender({
                    error: this.state.error,
                    resetErrorBoundary: this.resetErrorBoundary,
                    errorId: this.state.errorId,
                    retryCount: this.retryCount,
                    canRetry,
                });
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-md w-full mx-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-red-200 dark:border-red-800">
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0">
                                    <svg
                                        className="h-8 w-8 text-red-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                                        문제가 발생했습니다
                                    </h3>
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    애플리케이션에서 예상치 못한 오류가 발생했습니다.
                                    {canRetry && ' 다시 시도하거나'} 페이지를 새로고침해 주세요.
                                </p>

                                {this.state.errorId && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        오류 ID: {this.state.errorId}
                                    </p>
                                )}

                                {import.meta.env.DEV && this.state.error && (
                                    <details className="mt-4">
                                        <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-300">
                                            개발자 정보 (개발 환경에서만 표시)
                                        </summary>
                                        <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto">
                                            {this.state.error.message}
                                            {'\n\n'}
                                            {this.state.error.stack}
                                        </pre>
                                    </details>
                                )}
                            </div>

                            <div className="flex space-x-3">
                                {canRetry && (
                                    <button
                                        onClick={this.resetErrorBoundary}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
                                    >
                                        다시 시도 ({this.maxRetries - this.retryCount}회 남음)
                                    </button>
                                )}

                                <button
                                    onClick={this.handleReload}
                                    className={`${canRetry ? 'flex-1' : 'w-full'} bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors`}
                                >
                                    페이지 새로고침
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}