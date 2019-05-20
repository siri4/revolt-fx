// <reference types="pixi.js" />

import { AnimatedSprite, Texture } from "pixi.js";
import { FX } from "./FX";

export class MovieClip extends AnimatedSprite {

    public componentId: string;
    public __sequenceEndTime: number;
    public __fx: FX;

    constructor(componentId: string, textures: string[], anchorX?: number, anchorY?: number) {
        const t = [];
        const l = textures.length;
        for (let i = 0; i < l; i++) {
            t.push(Texture.from(textures[i]));
        }
        super(t);
        this.componentId = componentId;
        this.anchor.set(0.5, 0.5);
        this.loop = false;
        this.__sequenceEndTime = 0;
    }

    // *********************************************************************************************
    // * Public																		                                        			   *
    // *********************************************************************************************
    public recycle() {
        this.alpha = 1;
        this.tint = 0xffffff;
        this.transform .rotation = 0;
        this.transform.scale.set(1);
        if (this.parent) { this.parent.removeChild(this); }
        this.gotoAndStop(0);
        this.__fx.__recycleMovieClip(this.componentId, this);
    }

    public dispose() {
        if (this.parent) { this.parent.removeChild(this); }
        this.__fx = null;
        this.gotoAndStop(0);
        this.destroy();
    }

    // *********************************************************************************************
    // * Private																				                                           *
    // *********************************************************************************************

    // *********************************************************************************************
    // * Events																		                                        			   *
    // *********************************************************************************************

}
