import type { ComponentType, JSX } from 'react';
import type { ErrorBoundaryProps } from '@/shared/types';
import { ErrorFallback, ErrorBoundary } from "@/shared";

export const withErrorBoundary = <P extends object>(
    Component: ComponentType<P>,
    fallbackComponent?: (props: ErrorBoundaryProps) => JSX.Element
) => {
    return function WithErrorBoundary(props: P) {
        const FallbackComponent = fallbackComponent ?? ErrorFallback;

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