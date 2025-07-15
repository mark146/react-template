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
    });
}