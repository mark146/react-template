import { logBusinessLogicError, logBusinessLogicMessage, logComponentError, logComponentMessage } from '@/shared/error';
import type { BusinessLogicContext, ComponentErrorContext, SentryLevel, SentryUser } from '@/shared/types';

const loggedErrors = new WeakSet<Error>();
const loggedErrorMessages = new Set<string>();

const shouldSkipLogging = (error: Error, context: string): boolean => {
    if (loggedErrors.has(error)) {
        console.debug(`🔄 Skipping duplicate error log for: ${context}`, error.message);
        return true;
    }

    const errorKey = `${error.message}_${context}_${Date.now()}`;
    if (loggedErrorMessages.has(errorKey)) {
        console.debug(`🔄 Skipping duplicate error message for: ${context}`, error.message);
        return true;
    }

    loggedErrors.add(error);
    loggedErrorMessages.add(errorKey);

    setTimeout(() => {
        loggedErrorMessages.delete(errorKey);
    }, 5 * 60 * 1000);

    return false;
};

interface ComponentActionOptions {
    successMessage: string;
    errorMessage: string;
    errorToastMessage: string;
    state?: Record<string, any>;
    level?: SentryLevel;
    onError?: (message: string) => void;
    skipDuplicateLogging?: boolean;
}

interface BusinessValidationResult {
    isValid: boolean;
    shouldContinue: boolean;
    loggedLevel?: 'warning' | 'error';
}

function createLogContext(componentName?: string, action?: string) {
    return `${componentName ?? ''}.${action ?? ''}`;
}

function handleErrorLogging(error: Error, logContext: string, onError?: (msg: string) => void, errorToastMessage?: string) {
    if (shouldSkipLogging(error, logContext)) {
        onError?.(errorToastMessage ?? '');
        return true;
    }
    return false;
}

export const withComponentLogging = (
    context: ComponentErrorContext,
    user?: SentryUser
) => {
    const logContext = createLogContext(context.componentName, context.action);
    return {
        execute: <T>(
            action: () => T,
            options: ComponentActionOptions
        ): T | undefined => {
            try {
                return action();
            } catch (error) {
                const errorInstance = error instanceof Error ? error : new Error(options.errorMessage);
                if (options.skipDuplicateLogging && handleErrorLogging(errorInstance, logContext, options.onError, options.errorToastMessage)) {
                    return undefined;
                }
                logComponentError(errorInstance, {
                    ...context,
                    state: options.state
                }, 'error', user);
                options.onError?.(options.errorToastMessage);
                return undefined;
            }
        }
    };
};

export const withErrorBoundaryLogging = (config: {
    componentName: string;
    feature: string;
    maxRetries: number;
    user?: SentryUser;
}) => {
    const { componentName, feature, maxRetries, user } = config;
    const boundaryContext = `ErrorBoundary.${componentName}`;

    return {
        logError: (
            error: Error,
            context: {
                retryCount: number;
                props: any;
                state: any;
                errorInfo: any;
            }
        ) => {
            try {
                if (shouldSkipLogging(error, boundaryContext)) {
                    console.debug(`🔄 ErrorBoundary: Skipping duplicate error for ${componentName}`);
                    return;
                }

                logComponentError(error, {
                    componentName,
                    feature,
                    action: 'componentDidCatch',
                    props: {
                        retryCount: context.retryCount,
                        maxRetries,
                        errorBoundaryProps: Object.keys(context.props || {}),
                        isDuplicateHandling: false,
                    },
                    state: {
                        hasError: context.state?.hasError,
                        errorId: context.state?.errorId,
                    },
                }, 'fatal', user, {
                    useStructuredTitle: true,
                    titlePrefix: '💀 ErrorBoundary: ',
                });
            } catch (loggingError) {
                console.error('ErrorBoundary logging failed:', loggingError);
                console.error('Original error:', error);
            }
        },

        logRetry: (retryCount: number) => {
            try {
                logComponentMessage(
                    `ErrorBoundary retry attempt #${retryCount}`,
                    {
                        componentName,
                        feature,
                        action: 'resetErrorBoundary',
                        props: {
                            retryCount,
                            maxRetries,
                        },
                    },
                    'info',
                    user,
                    {
                        useStructuredTitle: true,
                        titlePrefix: '🔄 ErrorBoundary Retry: ',
                    }
                );
            } catch (loggingError) {
                console.error('ErrorBoundary retry logging failed:', loggingError);
            }
        },
        logCustomHandler: (handlerFn: () => void) => {
            try {
                handlerFn();
            } catch (handlerError) {
                try {
                    logComponentError(
                        handlerError instanceof Error ? handlerError : new Error('Custom error handler failed'),
                        {
                            componentName,
                            feature: 'error-boundary',
                            action: 'onError-handler-failed',
                        },
                        'error',
                        user,
                        {
                            useStructuredTitle: true,
                            titlePrefix: '⚠️ ErrorBoundary Handler: ',
                        }
                    );
                } catch {
                    console.error('ErrorBoundary custom handler logging failed:', handlerError);
                }
            }
        },
        logMaxRetriesExceeded: () => {
            try {
                logComponentError(
                    new Error(`ErrorBoundary max retries (${maxRetries}) exceeded`),
                    {
                        componentName,
                        feature,
                        action: 'maxRetriesExceeded',
                        props: { maxRetries },
                    },
                    'fatal',
                    user,
                    {
                        useStructuredTitle: true,
                        titlePrefix: '🚫 ErrorBoundary Fatal: ',
                    }
                );
            } catch (loggingError) {
                console.error('ErrorBoundary max retries logging failed:', loggingError);
            }
        },
        logRecovery: () => {
            try {
                logComponentMessage(
                    'ErrorBoundary successfully recovered',
                    {
                        componentName,
                        feature,
                        action: 'recovered',
                    },
                    'info',
                    user,
                    {
                        useStructuredTitle: true,
                        titlePrefix: '✅ ErrorBoundary Recovery: ',
                    }
                );
            } catch (loggingError) {
                console.error('ErrorBoundary recovery logging failed:', loggingError);
            }
        }
    };
};

export const withBusinessLogicLogging = (
    context: BusinessLogicContext & { componentName?: string; feature?: string; action?: string },
    user?: SentryUser
) => {
    const logContext = createLogContext(context.componentName, context.action);
    return {
        validateAndWarn: (
            warningMessage: string,
            inputValues: Record<string, any>,
            onWarn?: () => void
        ): BusinessValidationResult => {
            logBusinessLogicMessage(
                warningMessage,
                {
                    ...context,
                    inputValues,
                    componentName: context.componentName,
                    feature: context.feature,
                    action: context.action,
                },
                'warning',
                user
            );
            onWarn?.();
            return { isValid: false, shouldContinue: false, loggedLevel: 'warning' };
        },
        warn: (
            message: string,
            inputValues: Record<string, any>,
            onWarning?: () => void
        ): BusinessValidationResult => {
            const warningError = new Error(`Business warning: ${message}`);
            if (handleErrorLogging(warningError, logContext, onWarning)) {
                return {
                    isValid: true,
                    shouldContinue: true,
                    loggedLevel: 'warning'
                };
            }
            const fullContext = {
                ...context,
                inputValues,
                expectedBehavior: context.expectedBehavior,
                actualBehavior: `경고 상황: ${message}`
            };
            logBusinessLogicError(warningError, fullContext, 'warning', user);
            try {
                onWarning?.();
            } catch (callbackError) {
                console.error('Warning callback error:', callbackError);
            }
            return {
                isValid: true,
                shouldContinue: true,
                loggedLevel: 'warning'
            };
        },
        info: (
            message: string,
            inputValues: Record<string, any>,
            expectedBehavior?: string,
            actualBehavior?: string
        ): void => {
            const fullContext = {
                ...context,
                inputValues,
                expectedBehavior: expectedBehavior || context.expectedBehavior,
                actualBehavior: actualBehavior || context.actualBehavior
            };
            logBusinessLogicMessage(message, fullContext, 'info', user);
        },
        success: (
            message: string,
            inputValues: Record<string, any>,
            actualBehavior?: string
        ): void => {
            const fullContext = {
                ...context,
                inputValues,
                expectedBehavior: context.expectedBehavior,
                actualBehavior: actualBehavior || `성공: ${message}`
            };

            logBusinessLogicMessage(message, fullContext, 'info', user);
        }
    };
};