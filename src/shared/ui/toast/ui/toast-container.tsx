import type { FC } from 'react';
import { ToastItem } from './toast-item';
import type { ToastConfig } from '@/shared/types';

interface ToastContainerProps {
    toasts: ToastConfig[];
    onRemoveToast: (id: string) => void;
}

export const ToastContainer: FC<ToastContainerProps> = ({ toasts, onRemoveToast }) => {
    if (toasts.length === 0) {
        return null;
    }

    return (
        <div
            className="fixed top-4 right-4 z-50 space-y-2"
            role="alert"
            aria-live="polite"
            aria-atomic="false"
        >
            {toasts.map((toast) => (
                <ToastItem
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => onRemoveToast(toast.id)}
                />
            ))}
        </div>
    );
};