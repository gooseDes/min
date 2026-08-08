import type { MorphThingHandle } from "@/components/MorphThing";
import { createRef } from "react";

export const morphThingRef = createRef<MorphThingHandle>();

export function startMorph(from: Rect, to: Rect, color: string, borderRadius: string) {
    if (morphThingRef.current) {
        morphThingRef.current.startMorph(from, to, color, borderRadius);
    }
}
