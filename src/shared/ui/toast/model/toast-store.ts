import { createContext } from 'react';
import type { ToastContextValue } from '@/shared/types';

export const ToastContext = createContext<ToastContextValue | null>(null);