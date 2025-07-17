import type {
    ErrorMetadata,
    ComponentErrorContext,
    BusinessLogicContext,
    ApiErrorContext,
    SentryLevel,
    SentryTags,
    SentryContext,
    SentryUser
} from '@/shared/types';
import { captureException, captureMessage } from '@/shared/lib/sentry/config';
import { createSafeSummary } from './safe-json-utils';

export const generateErrorId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getErrorDetails = (error: Error): { message: string; stack?: string } => ({
    message: error.message,
    stack: error.stack,
});

export const DEFAULT_TOAST_DURATION = 5000;

export const buildBaseMetadata = (
    level: SentryLevel = 'error',
    baseTags: SentryTags = {},
    baseContexts: SentryContext = {},
    user?: SentryUser
): ErrorMetadata => ({
    level,
    tags: {
        environment: import.meta.env.MODE || 'development',
        timestamp: new Date().toISOString(),
        // 🔥 앱 버전 정보 추가
        'app.version': import.meta.env.VITE_APP_VERSION || '1.0.0',
        'app.buildHash': import.meta.env.VITE_BUILD_HASH || 'unknown',
        // 🔥 상세한 브라우저 정보
        'browser.name': getBrowserName(),
        'browser.version': getBrowserVersion(),
        'os.name': getOSName(),
        'os.version': getOSVersion(),
        // 🔥 디바이스 타입
        'device.type': getDeviceType(),
        'device.memory': (navigator as any).deviceMemory?.toString() || 'unknown',
        'connection.type': (navigator as any).connection?.effectiveType || 'unknown',
        // 🔥 화면 정보
        'screen.resolution': `${screen.width}x${screen.height}`,
        'viewport.size': `${window.innerWidth}x${window.innerHeight}`,
        ...baseTags,
    },
    contexts: {
        runtime: {
            name: 'browser',
            version: navigator.userAgent,
        },
        app: {
            app_start_time: performance.timeOrigin,
            build_type: import.meta.env.MODE,
            version: import.meta.env.VITE_APP_VERSION || '1.0.0',
            buildTime: import.meta.env.VITE_BUILD_TIME || 'unknown',
            buildHash: import.meta.env.VITE_BUILD_HASH || 'unknown',
            nodeVersion: import.meta.env.VITE_NODE_VERSION || 'unknown',
        },
        page_context: {
            pathname: window.location.pathname,
            search: window.location.search,
            hash: window.location.hash,
            referrer: document.referrer,
            title: document.title,
            scrollPosition: `${window.scrollX},${window.scrollY}`,
            loadTime: performance.now(),
        },
        session_context: {
            id: sessionStorage.getItem('sessionId') || 'unknown',
            startTime: sessionStorage.getItem('sessionStartTime') || new Date().toISOString(),
            pageViews: sessionStorage.getItem('pageViews') || '1',
        },
        ...baseContexts,
    },
    user,
    extra: {
        url: window.location.href,
        referrer: document.referrer,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        ...(('memory' in performance) && {
            memoryUsage: {
                used: (performance as any).memory.usedJSHeapSize,
                total: (performance as any).memory.totalJSHeapSize,
                limit: (performance as any).memory.jsHeapSizeLimit,
            }
        }),
    },
});

const getBrowserName = (): string => {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
};

const getBrowserVersion = (): string => {
    const ua = navigator.userAgent;
    const match = ua.match(/(Chrome|Firefox|Safari|Edge)\/(\d+)/);
    return match ? match[2] : 'Unknown';
};

const getOSName = (): string => {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac OS')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
};

const getOSVersion = (): string => {
    const ua = navigator.userAgent;
    if (ua.includes('Windows NT 10.0')) return '10+';
    if (ua.includes('Windows NT 6.3')) return '8.1';
    if (ua.includes('Windows NT 6.2')) return '8';
    if (ua.includes('Mac OS X')) {
        const match = ua.match(/Mac OS X (\d+_\d+)/);
        return match ? match[1].replace('_', '.') : 'Unknown';
    }
    return 'Unknown';
};

const getDeviceType = (): string => {
    const ua = navigator.userAgent;
    if (/Mobile|Android|iPhone/.test(ua)) return 'mobile';
    if (/iPad|Tablet/.test(ua)) return 'tablet';
    return 'desktop';
};

export const buildComponentErrorMetadata = (
    context: ComponentErrorContext,
    level: SentryLevel = 'error',
    user?: SentryUser,
    additionalTags: SentryTags = {},
    additionalContexts: SentryContext = {}
): ErrorMetadata => {
    const baseTags: SentryTags = {
        component: context.componentName,
        feature: context.feature,
        action: context.action,
        errorType: 'component',
        ...additionalTags,
    };

    const baseContexts: SentryContext = {
        component: {
            name: context.componentName,
            feature: context.feature,
            action: context.action,
            props: context.props ? createSafeSummary(context.props) : undefined,
            state: context.state ? createSafeSummary(context.state) : undefined,
        },
        ...additionalContexts,
    };

    const fingerprint = [
        'component-error',
        context.componentName,
        context.feature,
        context.action,
    ];

    return {
        ...buildBaseMetadata(level, baseTags, baseContexts, user),
        fingerprint,
    };
};

// 🔥 새로운 컴포넌트 정보 메타데이터 빌더 (에러가 아닌 정보성 로그용)
export const buildComponentInfoMetadata = (
    context: ComponentErrorContext,
    level: SentryLevel = 'info',
    user?: SentryUser,
    additionalTags: SentryTags = {},
    additionalContexts: SentryContext = {}
): ErrorMetadata => {
    const baseTags: SentryTags = {
        component: context.componentName,
        feature: context.feature,
        action: context.action,
        logType: 'component-info', // 🎯 에러가 아닌 정보성 로그임을 명시
        category: 'user-action', // 🎯 사용자 액션 카테고리
        ...additionalTags,
    };

    const baseContexts: SentryContext = {
        componentInfo: { // 🎯 'component'가 아닌 'componentInfo'로 구분
            name: context.componentName,
            feature: context.feature,
            action: context.action,
            // 🔥 안전한 직렬화 사용
            props: context.props ? createSafeSummary(context.props) : undefined,
            state: context.state ? createSafeSummary(context.state) : undefined,
        },
        ...additionalContexts,
    };

    const fingerprint = [
        'component-info', // 🎯 'component-error'가 아닌 'component-info'
        context.componentName,
        context.feature,
        context.action,
    ];

    return {
        ...buildBaseMetadata(level, baseTags, baseContexts, user),
        fingerprint,
    };
};

// 비즈니스 로직 에러 메타데이터 빌더
export const buildBusinessLogicErrorMetadata = (
    context: BusinessLogicContext,
    level: SentryLevel = 'error',
    user?: SentryUser,
    additionalTags: SentryTags = {}
): ErrorMetadata => {
    const baseTags: SentryTags = {
        businessRule: context.businessRule,
        errorType: 'business-logic',
        ...additionalTags,
    };

    const baseContexts: SentryContext = {
        businessLogic: {
            rule: context.businessRule,
            // 🔥 안전한 직렬화 사용
            inputValues: createSafeSummary(context.inputValues),
            expectedBehavior: context.expectedBehavior,
            actualBehavior: context.actualBehavior,
        },
    };

    const fingerprint = [
        'business-logic-error',
        context.businessRule,
        context.businessRule,
    ];

    return {
        ...buildBaseMetadata(level, baseTags, baseContexts, user),
        fingerprint,
        extra: {
            ...buildBaseMetadata().extra,
            inputValues: createSafeSummary(context.inputValues),
            expectedBehavior: context.expectedBehavior,
            actualBehavior: context.actualBehavior,
        },
    };
};

// 🔥 새로운 비즈니스 로직 정보 메타데이터 빌더 (에러가 아닌 정보성 로그용)
export const buildBusinessLogicInfoMetadata = (
    context: BusinessLogicContext,
    level: SentryLevel = 'info',
    user?: SentryUser,
    additionalTags: SentryTags = {}
): ErrorMetadata => {
    const baseTags: SentryTags = {
        businessRule: context.businessRule,
        logType: 'business-logic-info', // 🎯 정보성 로그임을 명시
        category: 'business-validation', // 🎯 비즈니스 검증 카테고리
        ...additionalTags,
    };

    const baseContexts: SentryContext = {
        businessLogicInfo: { // 🎯 'businessLogic'이 아닌 'businessLogicInfo'로 구분
            rule: context.businessRule,
            // 🔥 안전한 직렬화 사용
            inputValues: createSafeSummary(context.inputValues),
            expectedBehavior: context.expectedBehavior,
            actualBehavior: context.actualBehavior,
        },
    };

    const fingerprint = [
        'business-logic-info', // 🎯 'business-logic-error'가 아닌 'business-logic-info'
        context.businessRule,
        // inputValues를 직렬화하지 않고 rule만 사용
        context.businessRule,
    ];

    return {
        ...buildBaseMetadata(level, baseTags, baseContexts, user),
        fingerprint,
        extra: {
            ...buildBaseMetadata().extra,
            inputValues: createSafeSummary(context.inputValues),
            expectedBehavior: context.expectedBehavior,
            actualBehavior: context.actualBehavior,
        },
    };
};

// API 에러 메타데이터 빌더 (대폭 강화)
export const buildApiErrorMetadata = (
    context: ApiErrorContext,
    level: SentryLevel = 'error',
    user?: SentryUser,
    additionalTags: SentryTags = {},
    requestDetails?: {
        requestBody?: any;
        requestHeaders?: Record<string, string>;
        queryParams?: Record<string, string>;
        pathParams?: Record<string, string>;
        responseBody?: any;
        responseHeaders?: Record<string, string>;
        userAgent?: string;
        clientIp?: string;
        sessionId?: string;
        traceId?: string;
        correlationId?: string;
    }
): ErrorMetadata => {
    // 🔥 URL에서 쿼리 파라미터 추출
    const parseUrlParams = (url: string) => {
        try {
            const urlObj = new URL(url, window.location.origin);
            const params: Record<string, string> = {};
            urlObj.searchParams.forEach((value, key) => {
                // 민감한 정보 필터링
                if (['password', 'token', 'key', 'secret', 'authorization'].includes(key.toLowerCase())) {
                    params[key] = '[FILTERED]';
                } else {
                    params[key] = value;
                }
            });
            return {
                pathname: urlObj.pathname,
                search: urlObj.search,
                params
            };
        } catch {
            return { pathname: url, search: '', params: {} };
        }
    };

    const urlInfo = parseUrlParams(context.endpoint);

    const baseTags: SentryTags = {
        endpoint: context.endpoint,
        httpMethod: context.method,
        statusCode: context.statusCode?.toString() || 'unknown',
        errorType: 'api',
        // 🔥 API 카테고리 분류
        apiCategory: getApiCategory(context.endpoint),
        // 🔥 에러 심각도 분류
        errorSeverity: getErrorSeverity(context.statusCode),
        // 🔥 재시도 가능 여부
        retryable: isRetryableError(context.statusCode),
        ...additionalTags,
    };

    const baseContexts: SentryContext = {
        api: {
            endpoint: context.endpoint,
            method: context.method,
            statusCode: context.statusCode,
            requestId: context.requestId,
            responseTime: context.responseTime,
            // 🔥 URL 상세 정보
            urlPath: urlInfo.pathname,
            queryString: urlInfo.search,
            queryParams: createSafeSummary(urlInfo.params), // 🔥 안전한 직렬화
        },
        // 🔥 요청 세부사항
        request: {
            headers: requestDetails?.requestHeaders ?
                createSafeSummary(sanitizeHeaders(requestDetails.requestHeaders)) : undefined, // 🔥 안전한 직렬화
            body: requestDetails?.requestBody ?
                createSafeSummary(requestDetails.requestBody) : undefined, // 🔥 안전한 직렬화
            queryParams: requestDetails?.queryParams ?
                createSafeSummary(requestDetails.queryParams) : undefined, // 🔥 안전한 직렬화
            pathParams: requestDetails?.pathParams ?
                createSafeSummary(requestDetails.pathParams) : undefined, // 🔥 안전한 직렬화
            userAgent: requestDetails?.userAgent || navigator.userAgent,
            timestamp: new Date().toISOString(),
        },
        // 🔥 응답 세부사항
        response: {
            headers: requestDetails?.responseHeaders ?
                createSafeSummary(sanitizeHeaders(requestDetails.responseHeaders)) : undefined, // 🔥 안전한 직렬화
            body: requestDetails?.responseBody ?
                createSafeSummary(truncateResponseBody(requestDetails.responseBody)) : undefined, // 🔥 안전한 직렬화
            timestamp: new Date().toISOString(),
        },
        // 🔥 추적 정보
        tracing: {
            traceId: requestDetails?.traceId,
            correlationId: requestDetails?.correlationId,
            sessionId: requestDetails?.sessionId || sessionStorage.getItem('sessionId'),
            requestSequence: getRequestSequence(),
        }
    };

    // 🔥 API별 특별한 핑거프린트 생성
    const fingerprint = [
        'api-error',
        baseTags.apiCategory,
        context.method,
        urlInfo.pathname,
        context.statusCode?.toString() || 'unknown',
    ];

    return {
        ...buildBaseMetadata(level, baseTags, baseContexts, user),
        fingerprint,
        extra: {
            ...buildBaseMetadata().extra,
            // 🔥 API 에러 전용 추가 정보
            apiEndpoint: context.endpoint,
            httpMethod: context.method,
            statusCode: context.statusCode,
            requestId: context.requestId,
            responseTime: context.responseTime,
            queryParams: createSafeSummary(urlInfo.params), // 🔥 안전한 직렬화
            // 🔥 에러 분석용 정보
            isTimeout: context.responseTime ? context.responseTime > 30000 : false,
            isNetworkError: !context.statusCode,
            isServerError: context.statusCode ? context.statusCode >= 500 : false,
            isClientError: context.statusCode ? context.statusCode >= 400 && context.statusCode < 500 : false,
            // 🔥 복구 정보
            suggestedAction: getSuggestedAction(context.statusCode),
            affectedFeatures: getAffectedFeatures(context.endpoint),
        },
    };
};

// 🔥 헬퍼 함수들
const getApiCategory = (endpoint: string): string => {
    if (endpoint.includes('/auth/')) return 'authentication';
    if (endpoint.includes('/user/')) return 'user-management';
    if (endpoint.includes('/payment/')) return 'payment';
    if (endpoint.includes('/order/')) return 'order';
    if (endpoint.includes('/product/')) return 'product';
    return 'general';
};

const getErrorSeverity = (statusCode?: number): string => {
    if (!statusCode) return 'critical'; // 네트워크 에러
    if (statusCode >= 500) return 'critical';
    if (statusCode === 401 || statusCode === 403) return 'high';
    if (statusCode === 404) return 'medium';
    if (statusCode >= 400) return 'low';
    return 'info';
};

const isRetryableError = (statusCode?: number): string => {
    if (!statusCode) return 'yes'; // 네트워크 에러는 재시도 가능
    if ([408, 429, 500, 502, 503, 504].includes(statusCode)) return 'yes';
    return 'no';
};

const sanitizeHeaders = (headers: Record<string, string>): Record<string, string> => {
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];

    sensitiveHeaders.forEach(header => {
        if (sanitized[header]) {
            sanitized[header] = '[FILTERED]';
        }
    });

    return sanitized;
};

const truncateResponseBody = (body: any, maxLength: number = 1000): any => {
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
    if (bodyStr.length > maxLength) {
        return {
            truncated: true,
            originalLength: bodyStr.length,
            data: bodyStr.substring(0, maxLength) + '...[TRUNCATED]'
        };
    }
    return body;
};

let requestSequenceCounter = 0;
const getRequestSequence = (): number => ++requestSequenceCounter;

const getSuggestedAction = (statusCode?: number): string => {
    if (!statusCode) return 'Check network connection';
    if (statusCode === 401) return 'Re-authenticate user';
    if (statusCode === 403) return 'Check user permissions';
    if (statusCode === 404) return 'Verify API endpoint';
    if (statusCode === 429) return 'Implement rate limiting';
    if (statusCode >= 500) return 'Check server status';
    return 'Review request parameters';
};

const getAffectedFeatures = (endpoint: string): string[] => {
    const features: string[] = [];
    if (endpoint.includes('/auth/')) features.push('login', 'logout', 'registration');
    if (endpoint.includes('/user/')) features.push('profile', 'settings');
    if (endpoint.includes('/payment/')) features.push('checkout', 'billing');
    if (endpoint.includes('/order/')) features.push('shopping-cart', 'order-history');
    return features;
};


// 🔥 수정된 통합 로깅 함수 - 에러도 구조화된 제목 지원
export const logError = (
    error: unknown,
    metadata?: ErrorMetadata,
    options?: {
        useStructuredTitle?: boolean;
        titlePrefix?: string;
    }
) => {
    const errorInstance = error instanceof Error ? error : new Error(String(error));
    const level = metadata?.level || 'error';

    let finalMessage = errorInstance.message;
    if (options?.useStructuredTitle && metadata?.tags) {
        const component = metadata.tags.component;
        const feature = metadata.tags.feature;
        const action = metadata.tags.action;
        const prefix = options.titlePrefix || '';

        if (component && feature && action) {
            finalMessage = `${prefix}[${component}/${feature}] ${action}: ${errorInstance.message}`;
        } else if (options.titlePrefix) {
            finalMessage = `${prefix}${errorInstance.message}`;
        }
    } else if (options?.titlePrefix) {
        finalMessage = `${options.titlePrefix}${errorInstance.message}`;
    }

    const finalMetadata: ErrorMetadata = {
        ...buildBaseMetadata(),
        ...metadata,
        level,
        tags: {
            ...buildBaseMetadata().tags,
            ...metadata?.tags,
            originalErrorMessage: errorInstance.message,
        },
        contexts: {
            ...buildBaseMetadata().contexts,
            ...metadata?.contexts,
        },
        extra: {
            ...buildBaseMetadata().extra,
            ...metadata?.extra,
            errorMessage: errorInstance.message,
            errorStack: errorInstance.stack,
            originalErrorMessage: errorInstance.message,
            structuredTitle: options?.useStructuredTitle || false,
        },
    };

    if (level === 'error' || level === 'fatal') {
        // 🎯 실제 에러는 captureException 사용하되, 구조화된 제목을 위해 새 Error 객체 생성
        const structuredError = options?.useStructuredTitle ?
            new Error(finalMessage) : errorInstance;

        // 원본 스택을 보존
        if (options?.useStructuredTitle && errorInstance.stack) {
            structuredError.stack = errorInstance.stack;
        }

        captureException(structuredError, finalMetadata);
    } else {
        // info, warning, debug는 captureMessage 사용
        captureMessage(finalMessage, finalMetadata);
    }
};

// 🔥 새로운 함수: 메시지만 로깅하고 싶을 때 (구조화된 제목 포함)
export const logMessage = (
    message: string,
    metadata?: ErrorMetadata,
    options?: {
        useStructuredTitle?: boolean; // 🎯 구조화된 제목 사용 여부
        titlePrefix?: string; // 🎯 제목 접두사
    }
) => {
    const level = metadata?.level || 'info';
    let finalMessage = message;

    // 🎯 구조화된 제목 생성
    if (options?.useStructuredTitle && metadata?.tags) {
        const component = metadata.tags.component;
        const feature = metadata.tags.feature;
        const action = metadata.tags.action;
        const prefix = options.titlePrefix || '';

        if (component && feature && action) {
            finalMessage = `${prefix}[${component}/${feature}] ${action}: ${message}`;
        } else if (options.titlePrefix) {
            finalMessage = `${prefix}${message}`;
        }
    } else if (options?.titlePrefix) {
        finalMessage = `${options.titlePrefix}${message}`;
    }

    const finalMetadata: ErrorMetadata = {
        ...buildBaseMetadata(),
        ...metadata,
        level,
        tags: {
            ...buildBaseMetadata().tags,
            ...metadata?.tags,
            // 🎯 원본 메시지를 별도 태그로 저장
            originalMessage: message,
        },
        contexts: {
            ...buildBaseMetadata().contexts,
            ...metadata?.contexts,
        },
        extra: {
            ...buildBaseMetadata().extra,
            ...metadata?.extra,
            // 🎯 원본 메시지를 extra에도 저장
            originalMessage: message,
            structuredTitle: options?.useStructuredTitle || false,
        },
    };

    captureMessage(finalMessage, finalMetadata);
};

export const logComponentError = (
    error: unknown,
    context: ComponentErrorContext,
    level: SentryLevel = 'error',
    user?: SentryUser,
    options?: {
        useStructuredTitle?: boolean;
        titlePrefix?: string;
    }
) => {
    const metadata = buildComponentErrorMetadata(context, level, user);

    const defaultOptions = {
        useStructuredTitle: true,
        titlePrefix: level === 'fatal' ? '💀 ' : level === 'error' ? '🚨 ' : level === 'warning' ? '⚠️ ' : '🔍 ',
        ...options
    };

    logError(error, metadata, defaultOptions);
};

export const logComponentMessage = (
    message: string,
    context: ComponentErrorContext,
    level: SentryLevel = 'info',
    user?: SentryUser,
    options?: {
        useStructuredTitle?: boolean;
        titlePrefix?: string;
    }
) => {
    const metadata = buildComponentInfoMetadata(context, level, user);

    const defaultOptions = {
        useStructuredTitle: true,
        titlePrefix: level === 'info' ? '✅ ' : level === 'warning' ? '⚠️ ' : '📝 ',
        ...options
    };

    logMessage(message, metadata, defaultOptions);
};

export const logBusinessLogicError = (
    error: unknown,
    context: BusinessLogicContext,
    level: SentryLevel = 'error',
    user?: SentryUser,
    options?: {
        useStructuredTitle?: boolean;
        titlePrefix?: string;
    }
) => {
    const metadata = buildBusinessLogicErrorMetadata(context, level, user);

    const defaultOptions = {
        useStructuredTitle: true,
        titlePrefix: level === 'fatal' ? '💀 ' : level === 'error' ? '❌ ' : level === 'warning' ? '⚠️ ' : '🔍 ',
        ...options
    };

    logError(error, metadata, defaultOptions);
};

export const logBusinessLogicMessage = (
    message: string,
    context: BusinessLogicContext,
    level: SentryLevel = 'info',
    user?: SentryUser,
    options?: {
        useStructuredTitle?: boolean;
        titlePrefix?: string;
    }
) => {
    const metadata = buildBusinessLogicInfoMetadata(context, level, user);

    const defaultOptions = {
        useStructuredTitle: true,
        titlePrefix: level === 'info' ? '🔄 ' : level === 'warning' ? '⚠️ ' : '📋 ',
        ...options
    };

    logMessage(message, metadata, defaultOptions);
};

export const logApiError = (
    error: unknown,
    context: ApiErrorContext,
    level: SentryLevel = 'error',
    user?: SentryUser,
    options?: {
        useStructuredTitle?: boolean;
        titlePrefix?: string;
    }
) => {
    const metadata = buildApiErrorMetadata(context, level, user);

    const defaultOptions = {
        useStructuredTitle: true,
        titlePrefix: level === 'fatal' ? '💀 ' : level === 'error' ? '🌐 ' : level === 'warning' ? '⚠️ ' : '🔍 ',
        ...options
    };

    logError(error, metadata, defaultOptions);
};