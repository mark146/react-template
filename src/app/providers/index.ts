import { withErrorBoundary } from "@/shared/hoc/with-error-boundary";
import { withErrorToast } from "@/shared/hoc/with-error-toast";
import { compose } from '@/shared/lib';

export const withProviders = compose(
    withErrorBoundary,
    withErrorToast,
);