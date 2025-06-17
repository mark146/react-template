import { compose } from '@/shared/lib';
import { withErrorBoundary } from "@/app/providers/withErrorBoundary";
import { withErrorToast } from "@/app/providers/withErrorToast";

export const withProviders = compose(
    withErrorBoundary,
    withErrorToast,
);