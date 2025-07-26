import { useContext } from 'react';
import type { ToastContextValue } from '@/shared/types';
import { ToastContext } from "@/shared/ui/toast/model/toast-store.ts";

export const useToast = (): ToastContextValue => {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error('useToast must be used within ErrorToastProvider');
    }

    return context;
};