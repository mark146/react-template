import React from 'react';

// HOC(Higher-Order Component) 타입 정의
export type HOC<P = any> = (
    Component: React.ComponentType<P>
) => React.ComponentType<P>;

/**
 * 여러 HOC를 합성하는 유틸리티 함수
 * 오른쪽에서 왼쪽 순서로 합성됨 (마지막 HOC가 먼저 적용)
 * @param hocs 합성할 HOC 배열
 * @returns 합성된 단일 HOC
 */
export const compose = <P extends object = any>(...hocs: HOC<P>[]) => {
    return (Component: React.ComponentType<P>): React.ComponentType<P> => {
        return hocs.reduceRight(
            (acc, hoc) => hoc(acc),
            Component
        );
    };
};
