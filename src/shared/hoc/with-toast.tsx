import { type ComponentType, useState } from 'react';
import type { ErrorMetadata, SentryLevel, ToastConfig, ToastContextValue } from '../types';
import { DEFAULT_TOAST_DURATION, generateErrorId, logError } from '../error';
import { buildComponentErrorMetadata, ToastContainer, ToastContext } from "@/shared";

export const withToast = <P extends object>(
    Component: ComponentType<P>
) => {
    return function WithErrorToast(props: P) {
        const [toasts, setToasts] = useState<ToastConfig[]>([]);

        const showToast: ToastContextValue['showToast'] = (
            message,
            type = 'error',
            errorOrMeta = {}
        ) => {
            const id = generateErrorId();
            let errorStack: string | undefined;
            let metadata: Partial<ErrorMetadata> = {};

            if (errorOrMeta instanceof Error) {
                errorStack = errorOrMeta.stack;
                metadata = {};

                const errorMetadata = buildComponentErrorMetadata(
                    {
                        componentName: 'ErrorToast',
                        feature: 'toast-display',
                        action: 'showToast',
                    },
                    type as SentryLevel || 'error'
                );

                logError(errorOrMeta, errorMetadata);
            } else {
                metadata = errorOrMeta ?? {};

                if (metadata._logError) {
                    logError(metadata._logError.error, metadata._logError.meta);
                }
            }

            const duration = metadata.duration ?? DEFAULT_TOAST_DURATION;

            const newToast: ToastConfig = {
                id,
                message,
                type,
                duration,
                persistent: metadata.persistent,
                errorStack,
                level: metadata.level,
                tags: metadata.tags,
                contexts: metadata.contexts,
                extra: metadata.extra,
                user: metadata.user,
                fingerprint: metadata.fingerprint,
            };

            setToasts(prev => [...prev, newToast]);

            if (!metadata.persistent && duration > 0) {
                setTimeout(() => {
                    removeToast(id);
                }, duration);
            }
        };

        const removeToast = (id: string): void => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        };

        const clearAllToasts = (): void => {
            setToasts([]);
        };

        const contextValue: ToastContextValue = {
            showToast,
            removeToast,
            clearAllToasts,
        };

        return (
            <ToastContext.Provider value={contextValue}>
                <Component {...props} />
                <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
            </ToastContext.Provider>
        );
    };
};