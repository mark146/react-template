import { useState, type ComponentType } from 'react';
import { ErrorToastContext } from '@/shared/ui/ErrorToast';
import { ToastItem } from '@/shared/ui/ErrorToast';

interface Toast {
    id: string;
    message: string;
    type: 'error' | 'success' | 'warning' | 'info';
}

export const withErrorToast = (Component: ComponentType) => {
    return function WithErrorToast(props: any) {
        const [toasts, setToasts] = useState<Toast[]>([]);

        const showError = (message: string, type: 'error' | 'success' | 'warning' | 'info' = 'error') => {
            const id = Date.now().toString();
            const newToast: Toast = { id, message, type };

            setToasts(prev => [...prev, newToast]);

            setTimeout(() => {
                removeToast(id);
            }, 5000);
        };

        const removeToast = (id: string) => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        };

        return (
            <ErrorToastContext.Provider value={{ showError }}>
                <Component {...props} />

                <div className="fixed top-4 right-4 z-50 space-y-2">
                    {toasts.map(toast => (
                        <ToastItem
                            key={toast.id}
                            message={toast.message}
                            type={toast.type}
                            onClose={() => removeToast(toast.id)}
                        />
                    ))}
                </div>
            </ErrorToastContext.Provider>
        );
    };
};