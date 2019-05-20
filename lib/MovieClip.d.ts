import { AnimatedSprite } from "pixi.js";
import { FX } from "./FX";
export declare class MovieClip extends AnimatedSprite {
    componentId: string;
    __sequenceEndTime: number;
    __fx: FX;
    constructor(componentId: string, textures: string[], anchorX?: number, anchorY?: number);
    recycle(): void;
    dispose(): void;
}
