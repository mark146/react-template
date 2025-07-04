import type { ComponentType } from 'react';

type HOC<T = any> = (component: ComponentType<T>) => ComponentType<T>;

export function compose<T = any>(...hocs: HOC<T>[]): HOC<T> {
    return (component: ComponentType<T>) => {
        return hocs.reduceRight((acc, hoc) => hoc(acc), component);
    };
}