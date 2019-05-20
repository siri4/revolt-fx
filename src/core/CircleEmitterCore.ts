// <reference types="pixi.js" />

import { ICircleCoreParams } from "../FX";
import { Particle } from "../Particle";
import { Rnd } from "../util/Rnd";
import { BaseEmitterCore } from "./BaseEmitterCore";

export class CircleEmitterCore extends BaseEmitterCore {

    constructor() {
        super(BaseEmitterCore.__TYPE_CIRCLE);
    }

    // *********************************************************************************************
    // * Public																	                                        				   *
    // *********************************************************************************************

    public emit(particle: Particle) {

        const settings = this._settings as ICircleCoreParams;
        const emitter = this.emitter;

        let angle;
        angle = settings.angle
            ? Rnd.float(-settings.angle * 0.5, settings.angle * 0.5) + emitter.rotation
            : Rnd.float(0, 6.28319) + emitter.rotation;

        if (settings.radius > 0) {
            const r = Rnd.float(0, settings.radius) * this.__scaleMod;
            particle.component.transform.position.x = (this.__x + this._t * (this.x - this.__x)) + Math.cos(angle) * r;
            particle.component.transform.position.y = (this.__y + this._t * (this.y - this.__y)) + Math.sin(angle) * r;
        } else {
            particle.component.x = this.__x + this._t * (this.x - this.__x);
            particle.component.y = this.__y + this._t * (this.y - this.__y);
        }

        if (settings.radial) {
            particle.dx = Math.cos(angle);
            particle.dy = Math.sin(angle);
            particle.component.transform.rotation = angle;
        } else {
            particle.dx = this._dx;
            particle.dy = this._dy;
            particle.component.transform.rotation = emitter.rotation;
        }

        this._t += this._posInterpolationStep;

    }

    // *********************************************************************************************
    // * Private									                                        											   *
    // *********************************************************************************************

    // *********************************************************************************************
    // * Events							                                        														   *
    // *********************************************************************************************

}
