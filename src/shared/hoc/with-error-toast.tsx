import { type ComponentType, useState } from 'react';
import { ErrorToastContext, ToastContainer } from '@/shared/ui/toast';
import { DEFAULT_TOAST_DURATION, generateErrorId } from '@/shared/lib/error-handling';
import type { ErrorToastContextValue, ToastConfig } from '@/shared/types';

export const withErrorToast = <P extends object>(
    Component: ComponentType<P>
) => {
    return function WithErrorToast(props: P) {
        const [toasts, setToasts] = useState<ToastConfig[]>([]);

        const showToast: ErrorToastContextValue['showToast'] = (
            message,
            type = 'error',
            options = {}
        ) => {
            const id = generateErrorId();
            const duration = options.duration ?? DEFAULT_TOAST_DURATION;

            const newToast: ToastConfig = {
                id,
                message,
                type,
                duration,
                ...options,
            };

            setToasts(prev => [...prev, newToast]);

            if (!options.persistent && duration > 0) {
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

        const contextValue: ErrorToastContextValue = {
            showToast,
            removeToast,
            clearAllToasts,
        };

        return (
            <ErrorToastContext.Provider value={contextValue}>
                <Component {...props} />
                <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
            </ErrorToastContext.Provider>
        );
    };
};