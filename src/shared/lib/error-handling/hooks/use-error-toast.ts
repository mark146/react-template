import { useContext } from 'react';
import { ErrorToastContext } from '@/shared/ui/toast';
import type { ErrorToastContextValue } from '@/shared/types';

export const useErrorToast = (): ErrorToastContextValue => {
    const context = useContext(ErrorToastContext);

    if (!context) {
        throw new Error('useErrorToast must be used within ErrorToastProvider');
    }

    return context;
};