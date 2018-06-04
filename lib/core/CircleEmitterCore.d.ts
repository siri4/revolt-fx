import { BaseEmitterCore } from "./BaseEmitterCore";
import { ParticleEmitter } from "../ParticleEmitter";
import { Particle } from "../Particle";
export declare class CircleEmitterCore extends BaseEmitterCore {
    constructor(emitter: ParticleEmitter);
    emit(particle: Particle): void;
}