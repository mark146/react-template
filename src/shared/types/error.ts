export interface BaseError {
    message: string;
    code?: string;
    timestamp?: number;
}

export interface ToastConfig {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
    persistent?: boolean;
}

export type ToastType = 'error' | 'success' | 'warning' | 'info';

export interface ErrorBoundaryProps {
    error?: Error;
    resetErrorBoundary: () => void;
}

export interface ErrorToastContextValue {
    showToast: (message: string, type?: ToastType, options?: Partial<ToastConfig>) => void;
    removeToast: (id: string) => void;
    clearAllToasts: () => void;
}