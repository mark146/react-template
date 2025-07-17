import * as Sentry from '@sentry/react';
import type { ErrorMetadata } from '@/shared/types';

export function initSentry(): void {
    if (!import.meta.env.VITE_SENTRY_DSN) {
        console.warn('⚠️ Sentry DSN이 설정되지 않았습니다.');
        return;
    }

    const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';
    const buildHash = import.meta.env.VITE_BUILD_HASH || 'unknown';
    const release = `${appVersion}@${buildHash}`;

    Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        environment: import.meta.env.MODE || 'development',
        release,
        normalizeDepth: 6,
        sendDefaultPii: true,
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration(),
        ],
        tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
        replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
        replaysOnErrorSampleRate: 1.0,

        initialScope: (scope) => {
            scope.setTag('app.version', appVersion);
            scope.setTag('app.buildHash', buildHash);
            scope.setTag('app.buildTime', import.meta.env.VITE_BUILD_TIME || 'unknown');
            scope.setTag('screen.resolution', `${screen.width}x${screen.height}`);
            scope.setTag('viewport.size', `${window.innerWidth}x${window.innerHeight}`);
            scope.setTag('device.memory', (navigator as any).deviceMemory || 'unknown');
            scope.setTag('connection.type', (navigator as any).connection?.effectiveType || 'unknown');
            scope.setContext('app_details', {
                name: 'Vite React App',
                version: appVersion,
                buildTime: import.meta.env.VITE_BUILD_TIME,
                buildHash: buildHash,
                nodeVersion: import.meta.env.VITE_NODE_VERSION,
                reactVersion: '18.x',
                environment: import.meta.env.MODE,
            });

            scope.setContext('device_details', {
                platform: navigator.platform,
                userAgent: navigator.userAgent,
                language: navigator.language,
                languages: navigator.languages,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                screenResolution: `${screen.width}x${screen.height}`,
                colorDepth: screen.colorDepth,
                pixelDepth: screen.pixelDepth,
                viewportSize: `${window.innerWidth}x${window.innerHeight}`,
                pixelRatio: window.devicePixelRatio,
                memory: (navigator as any).deviceMemory,
                hardwareConcurrency: navigator.hardwareConcurrency,
                connection: (navigator as any).connection?.effectiveType,
                cookieEnabled: navigator.cookieEnabled,
                onLine: navigator.onLine,
            });

            scope.setContext('page_details', {
                url: window.location.href,
                pathname: window.location.pathname,
                search: window.location.search,
                hash: window.location.hash,
                host: window.location.host,
                protocol: window.location.protocol,
                referrer: document.referrer,
                title: document.title,
                characterSet: document.characterSet,
                contentType: document.contentType,
                loadTime: performance.now(),
            });

            if ('memory' in performance) {
                scope.setContext('performance_memory', {
                    usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
                    totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
                    jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
                });
            }

            const sessionId = sessionStorage.getItem('sessionId') ||
                (() => {
                    const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    sessionStorage.setItem('sessionId', id);
                    return id;
                })();

            scope.setContext('session_details', {
                id: sessionId,
                startTime: new Date().toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                release: release,
            });

            return scope;
        },

        beforeSend(event) {
            if (event.contexts) {
                event.contexts.current_page = {
                    url: window.location.href,
                    pathname: window.location.pathname,
                    timestamp: new Date().toISOString(),
                    documentTitle: document.title,
                    scrollPosition: {
                        x: window.scrollX,
                        y: window.scrollY,
                    },
                    viewportSize: `${window.innerWidth}x${window.innerHeight}`,
                };

                if ('memory' in performance) {
                    event.contexts.current_memory = {
                        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
                        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
                        usagePercentage: ((performance as any).memory.usedJSHeapSize / (performance as any).memory.jsHeapSizeLimit * 100).toFixed(2),
                        timestamp: new Date().toISOString(),
                    };
                }
            }

            return event;
        },
    });

    const sessionUser = sessionStorage.getItem('user');
    if (sessionUser) {
        try {
            const user = JSON.parse(sessionUser);
            Sentry.setUser({
                id: user.id,
                email: user.email,
                username: user.username,
            });
        } catch (e) {
            console.warn('사용자 정보 파싱 실패:', e);
        }
    }
}

export const captureException = (
    error: Error,
    metadata?: ErrorMetadata
) => {
    if (!import.meta.env.VITE_SENTRY_DSN) {
        console.group('🚨 Error captured (Sentry not configured)');
        console.error('Error:', error);
        console.log('Metadata:', metadata);
        console.groupEnd();
        return;
    }

    Sentry.withScope((scope) => {
        if (metadata?.level) {
            scope.setLevel(metadata.level);
        }

        if (metadata?.tags) {
            Object.entries(metadata.tags).forEach(([key, value]) => {
                scope.setTag(key, String(value));
            });
        }

        if (metadata?.contexts) {
            Object.entries(metadata.contexts).forEach(([key, context]) => {
                scope.setContext(key, context);
            });
        }

        if (metadata?.extra) {
            Object.entries(metadata.extra).forEach(([key, value]) => {
                scope.setExtra(key, value);
            });
        }

        if (metadata?.user) {
            scope.setUser(metadata.user);
        }

        if (metadata?.fingerprint) {
            scope.setFingerprint(metadata.fingerprint);
        }

        scope.addBreadcrumb({
            message: `Error occurred: ${error.message}`,
            level: 'error',
            timestamp: Date.now() / 1000,
            data: {
                errorName: error.name,
                errorStack: error.stack?.split('\n')[0] || 'No stack available',
            },
        });

        Sentry.captureException(error);
    });
};

export const captureMessage = (
    message: string,
    metadata?: ErrorMetadata
) => {
    if (!import.meta.env.VITE_SENTRY_DSN) {
        console.log('📝 Message captured (Sentry not configured):', message, metadata);
        return;
    }

    Sentry.withScope((scope) => {
        if (metadata?.level) {
            scope.setLevel(metadata.level);
        }
        if (metadata?.tags) {
            Object.entries(metadata.tags).forEach(([key, value]) => {
                scope.setTag(key, String(value));
            });
        }
        if (metadata?.contexts) {
            Object.entries(metadata.contexts).forEach(([key, context]) => {
                scope.setContext(key, context);
            });
        }
        if (metadata?.extra) {
            Object.entries(metadata.extra).forEach(([key, value]) => {
                scope.setExtra(key, value);
            });
        }
        if (metadata?.user) {
            scope.setUser(metadata.user);
        }
        if (metadata?.fingerprint) {
            scope.setFingerprint(metadata.fingerprint);
        }

        Sentry.captureMessage(message, metadata?.level || 'info');
    });
};
