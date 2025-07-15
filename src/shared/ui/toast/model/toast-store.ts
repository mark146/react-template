import { createContext } from 'react';
import type { ErrorToastContextValue } from '@/shared/types';

export const ErrorToastContext = createContext<ErrorToastContextValue | null>(null);