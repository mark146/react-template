import { withErrorBoundary } from "@/shared/hoc/with-error-boundary";
import { withErrorToast } from "@/shared/hoc/with-error-toast";
import { compose } from '@/shared/lib';
import { withErrorMonitoring } from "@/shared/hoc/with-error-monitoring";

export const withProviders = compose(
    withErrorMonitoring,
    withErrorBoundary,
    withErrorToast,
);