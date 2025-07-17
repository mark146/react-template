/**
 * 안전한 객체 요약 생성 (로깅용)
 */
export const createSafeSummary = (obj: any): any => {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
        return obj;
    }

    if (typeof obj === 'function') {
        return `[Function: ${obj.name || 'anonymous'}]`;
    }

    if (obj instanceof Error) {
        return {
            type: 'Error',
            name: obj.name,
            message: obj.message,
            stack: obj.stack?.split('\n')[0] // 첫 번째 스택만
        };
    }

    if (Array.isArray(obj)) {
        return {
            type: 'Array',
            length: obj.length,
            sample: obj.slice(0, 3).map(createSafeSummary)
        };
    }

    if (typeof obj === 'object') {
        // React 관련 객체 감지
        if (obj.$typeof || obj._owner || obj.props) {
            return '[React Component]';
        }

        if (obj.nodeType) {
            return `[DOM Node: ${obj.nodeName}]`;
        }

        // 일반 객체 요약
        const keys = Object.keys(obj);
        const summary: any = {
            type: 'Object',
            keyCount: keys.length
        };

        // 안전한 키들만 포함
        const safeKeys = keys.filter(key =>
            !key.startsWith('_') &&
            !key.includes('react') &&
            !key.includes('fiber')
        ).slice(0, 5);

        safeKeys.forEach(key => {
            try {
                summary[key] = createSafeSummary(obj[key]);
            } catch {
                summary[key] = '[Cannot Access]';
            }
        });

        if (keys.length > 5) {
            summary['...'] = `[${keys.length - 5} more keys]`;
        }

        return summary;
    }

    return obj;
};
