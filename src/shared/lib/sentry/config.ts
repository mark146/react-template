import * as Sentry from '@sentry/react';

interface SentryConfig {
    dsn: string;
    environment: string;
    tracesSampleRate: number;
    replaysSessionSampleRate: number;
    replaysOnErrorSampleRate: number;
}

const getConfig = (): SentryConfig => ({
    dsn: import.meta.env.VITE_SENTRY_DSN || '',
    environment: import.meta.env.MODE || 'development',
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,
});

export function initSentry(): void {
    if (!import.meta.env.VITE_SENTRY_DSN) {
        return;
    }

    const config = getConfig();

    Sentry.init({
        dsn: config.dsn,
        environment: config.environment,
        sendDefaultPii: true,
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration(),
        ],
        tracesSampleRate: config.tracesSampleRate,
        tracePropagationTargets: [
            'localhost',
            /^https:\/\/yourserver\.io\/api/,
        ],
        replaysSessionSampleRate: config.replaysSessionSampleRate,
        replaysOnErrorSampleRate: config.replaysOnErrorSampleRate,
        beforeSend(event, hint) {
            if (import.meta.env.DEV) {
                console.error('🚨 Sentry Error:', event, hint);
            }
            return event;
        },
    });
}

export const captureException = (error: Error, context?: {
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    user?: Record<string, any>;
    fingerprint?: string[];
}) => {
    if (!import.meta.env.VITE_SENTRY_DSN) {
        console.error('Error captured (Sentry not configured):', error, context);
        return;
    }

    Sentry.withScope((scope) => {
        if (context?.tags) {
            Object.entries(context.tags).forEach(([key, value]) => {
                scope.setTag(key, value);
            });
        }

        if (context?.extra) {
            Object.entries(context.extra).forEach(([key, value]) => {
                scope.setExtra(key, value);
            });
        }

        if (context?.user) {
            scope.setUser(context.user);
        }

        if (context?.fingerprint) {
            scope.setFingerprint(context.fingerprint);
        }

        Sentry.captureException(error);
    });
};
