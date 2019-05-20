import { Sprite as PixiSprite } from "pixi.js";
import { FX } from "./FX";
export declare class Sprite extends PixiSprite {
    componentId: string;
    __sequenceEndTime: number;
    __fx: FX;
    constructor(componentId: string, texture: string, anchorX?: number, anchorY?: number);
    recycle(): void;
    dispose(): void;
}
