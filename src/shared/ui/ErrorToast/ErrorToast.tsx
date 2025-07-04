import { createContext, useContext } from 'react';

interface ErrorToastContextType {
    showError: (message: string, type?: 'error' | 'success' | 'warning' | 'info') => void;
}

export const ErrorToastContext = createContext<ErrorToastContextType | null>(null);

export const useErrorToast = () => {
    const context = useContext(ErrorToastContext);
    if (!context) {
        throw new Error('useErrorToast must be used within ErrorToastProvider');
    }
    return context;
};
