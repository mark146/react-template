import { compose, withErrorBoundary, withErrorMonitoring, withToast } from "@/shared";

export const withProviders = compose(
    withErrorMonitoring,
    withErrorBoundary,
    withToast,
);