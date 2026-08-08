import { cubicBezier, useAnimate } from "framer-motion";
import { useImperativeHandle, type Ref } from "react";
import styles from "./MorphThing.module.scss";

export interface MorphThingHandle {
    startMorph: (from: Rect, to: Rect, color: string, borderRadius: string) => void;
}

export interface MorphThingProps {
    ref?: Ref<MorphThingHandle>;
}

function MorphThing({ ref }: MorphThingProps) {
    const [scope, animate] = useAnimate();

    useImperativeHandle(ref, () => ({
        startMorph: async (from: Rect, to: Rect, color: string, borderRadius: string) => {
            await animate(
                scope.current,
                {
                    opacity: 1,
                    x: from.x,
                    y: from.y,
                    width: from.width,
                    height: from.height,
                    backgroundColor: color,
                    borderRadius: borderRadius,
                },
                { duration: 0 },
            );
            await new Promise(requestAnimationFrame);
            await animate(
                scope.current,
                { x: to.x, y: to.y, width: to.width, height: to.height },
                { ease: cubicBezier(0.22, 0.61, 0.36, 1), duration: 0.5 },
            );
            await animate(scope.current, { opacity: 0 }, { duration: 0.3 });
        },
    }));

    return <div className={styles.container} ref={scope} />;
}

export default MorphThing;
