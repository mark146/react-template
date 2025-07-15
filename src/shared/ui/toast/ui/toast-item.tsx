import type { FC } from 'react';
import type { ToastConfig } from '@/shared/types';

interface ToastItemProps extends Pick<ToastConfig, 'message' | 'type'> {
    onClose: () => void;
}

const TOAST_STYLES = {
    error: 'bg-red-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
} as const;

const TOAST_ICONS = {
    error: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </svg>
    ),
    success: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
            />
        </svg>
    ),
    warning: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01M6.938 17h10.124c1.54 0 2.502-1.667 1.732-2.5L13.732 6c-.77-.833-1.964-.833-2.732 0L3.732 14.5c-.77.833.192 2.5 1.732 2.5z"
            />
        </svg>
    ),
    info: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </svg>
    ),
} as const;

export const ToastItem: FC<ToastItemProps> = ({ message, type, onClose }) => {
    const baseClasses = 'text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between max-w-md animate-in slide-in-from-right';
    const typeClasses = TOAST_STYLES[type];

    return (
        <div className={`${baseClasses} ${typeClasses}`}>
            <div className="flex items-center">
                <div className="mr-2" aria-hidden="true">
                    {TOAST_ICONS[type]}
                </div>
                <span className="text-sm font-medium">{message}</span>
            </div>
            <button
                onClick={onClose}
                className="ml-3 text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded"
                aria-label="토스트 닫기"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>
        </div>
    );
};