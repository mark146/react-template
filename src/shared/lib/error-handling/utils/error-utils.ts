import type { BaseError } from '@/shared/types';
import { captureException } from '@/shared/lib/sentry/config';

export const generateErrorId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatErrorMessage = (error: Error | BaseError | string): string => {
    if (typeof error === 'string') {
        return error;
    }

    if ('message' in error) {
        return error.message;
    }

    return '알 수 없는 오류가 발생했습니다.';
};

export const getErrorDetails = (error: Error): { message: string; stack?: string } => ({
    message: error.message,
    stack: error.stack,
});

export const DEFAULT_TOAST_DURATION = 5000;
export const PERSISTENT_TOAST_DURATION = -1;

export interface ErrorLogger {
    logError: (error: unknown, context?: Record<string, any>) => void;
}

export let errorLogger: ErrorLogger = {
    logError: (error, context) => {
        captureException(
            error instanceof Error ? error : new Error(String(error)),
            { extra: context }
        );
        if (import.meta.env.DEV) {
            console.error('Error:', error, context);
        }
    },
};
