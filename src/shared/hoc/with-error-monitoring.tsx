import type { ComponentType } from "react";
import { initSentry } from "@/shared/lib";

export const withErrorMonitoring = <P extends object>(
    Component: ComponentType<P>,
) => {
    initSentry();

    return function WithErrorMonitoring(props: P) {
        return (
            <>
                <Component {...props} />
            </>
        );
    };
};
