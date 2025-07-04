import { withErrorBoundary } from "@/app/providers/withErrorBoundary";
import { withErrorToast } from "@/app/providers/withErrorToast";
import { compose } from '@/shared/lib';

export const withProviders = compose(
    withErrorBoundary,
    withErrorToast,
);