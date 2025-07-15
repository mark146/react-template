import type { ComponentType, JSX } from 'react';
import { AlertErrorFallback, ErrorBoundary } from '@/shared/ui/error-boundary';
import type { ErrorBoundaryProps } from '@/shared/types';

export const withErrorBoundary = <P extends object>(
    Component: ComponentType<P>,
    fallbackComponent?: (props: ErrorBoundaryProps) => JSX.Element
) => {
    return function WithErrorBoundary(props: P) {
        const FallbackComponent = fallbackComponent ?? AlertErrorFallback;

        return (
            <ErrorBoundary
                fallbackRender={(fallbackProps: ErrorBoundaryProps) => (
                    <FallbackComponent {...fallbackProps} />
                )}
            >
                <Component {...props} />
            </ErrorBoundary>
        );
    };
};