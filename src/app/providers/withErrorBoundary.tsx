import type { ComponentType } from "react";
import { ErrorBoundary, type FallbackProps } from "@/shared/ui";
import { AlertErrorFallback } from "@/shared/ui/ErrorBoundary/AlertErrorFallback";

export const withErrorBoundary = (Component: ComponentType) => {
    return function WithErrorBoundary(props: any) {
        return (
            <ErrorBoundary
                fallbackRender={(fallbackProps: FallbackProps) => (
                    <AlertErrorFallback {...fallbackProps} />
                )}
            >
                <Component {...props} />
            </ErrorBoundary>
        );
    };
};