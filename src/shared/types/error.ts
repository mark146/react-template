export interface BaseError {
    message: string;
    code?: string;
    timestamp?: number;
}

export type ToastType = 'error' | 'success' | 'warning' | 'info';

export type SentryLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

export interface SentryUser {
    id?: string;
    email?: string;
    username?: string;
    ip_address?: string;
}

export interface SentryContext {
    [key: string]: {
        [key: string]: any;
    };
}

export interface SentryTags {
    [key: string]: string;
}

export interface SentryExtra {
    [key: string]: any;
}

export interface ErrorMetadata {
    level?: SentryLevel;
    tags?: SentryTags;
    contexts?: SentryContext;
    extra?: SentryExtra;
    user?: SentryUser;
    fingerprint?: string[];
    message?: string;
    // 🔥 Toast 관련 속성 추가
    duration?: number;
    persistent?: boolean;
    errorStack?: string;
    // 🔥 logError를 위한 내부 속성
    _logError?: {
        error: Error;
        meta: ErrorMetadata;
    };
}

export interface ToastConfig extends Partial<ErrorMetadata> {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
    persistent?: boolean;
    errorStack?: string;
}

export interface ErrorBoundaryProps {
    error?: Error;
    resetErrorBoundary: () => void;
    errorId?: string;
    retryCount?: number;
    canRetry?: boolean;
}

export interface ErrorToastContextValue {
    showToast: (
        message: string,
        type?: ToastType,
        errorOrMeta?: Error | Partial<ErrorMetadata>
    ) => void;
    removeToast: (id: string) => void;
    clearAllToasts: () => void;
}

export interface ComponentErrorContext {
    componentName: string;
    feature: string;
    action: string;
    props?: Record<string, any>;
    state?: Record<string, any>;
}

export interface BusinessLogicContext {
    componentName: string;
    feature: string;
    action: string;
    businessRule: string;
    expectedBehavior: string;
    actualBehavior: string;
    inputValues?: Record<string, any>;
}

export interface ApiErrorContext {
    endpoint: string;
    method: string;
    statusCode?: number;
    requestId?: string;
    responseTime?: number;
}