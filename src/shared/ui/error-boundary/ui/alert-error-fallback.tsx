import type { FC } from 'react';
import type { ErrorBoundaryProps } from '@/shared/types';
import { getErrorDetails } from '@/shared/lib/error-handling';

export const AlertErrorFallback: FC<ErrorBoundaryProps> = ({
                                                               error,
                                                               resetErrorBoundary
                                                           }) => {
    const handleRefresh = (): void => {
        window.location.reload();
    };

    const errorDetails = error ? getErrorDetails(error) : null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <svg
                            className="h-6 w-6 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>

                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        애플리케이션 오류
                    </h3>

                    <p className="text-gray-600 mb-6">
                        예상치 못한 오류가 발생했습니다. 다시 시도해주세요.
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={resetErrorBoundary}
                            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                        >
                            다시 시도
                        </button>

                        <button
                            onClick={handleRefresh}
                            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                        >
                            페이지 새로고침
                        </button>
                    </div>

                    {errorDetails && import.meta.env.DEV && (
                        <details className="mt-4 text-left">
                            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                                개발자 정보
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto whitespace-pre-wrap">
                                {errorDetails.message}
                                {errorDetails.stack && (
                                    <>
                                        {'\n'}
                                        {errorDetails.stack}
                                    </>
                                )}
                            </pre>
                        </details>
                    )}
                </div>
            </div>
        </div>
    );
};