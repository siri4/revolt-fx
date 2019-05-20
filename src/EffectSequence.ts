// <reference types="pixi.js" />

import { Container } from "pixi.js";
import { BaseEffect } from "./BaseEffect";
import { FX, IEffectSequenceSettings, IEffectSettings, IMovieClipComponentParams } from "./FX";
import { MovieClip } from "./MovieClip";
import { ParticleEmitter } from "./ParticleEmitter";
import { Sprite } from "./Sprite";
import { FXSignal } from "./util/FXSignal";
import { LinkedList, Node } from "./util/LinkedList";
import { Rnd } from "./util/Rnd";

export interface IEffectSequenceSignals {
    started: FXSignal;
    completed: FXSignal;
    exhausted: FXSignal;
    effectSpawned: FXSignal;
    triggerActivated: FXSignal;
}

export class EffectSequence extends BaseEffect {

    public settings: IEffectSequenceSettings;

    private _startTime: number;

    private _effectStartTime: number;
    private _nextEffectSettings: IEffectSettings;

    private _list: IEffectSettings[];
    private _index: number;
    private _scaleMod: number;
    private _delay: number;

    private _elements: LinkedList = new LinkedList();

    public __on: IEffectSequenceSignals = {
        started: new FXSignal(),
        completed: new FXSignal(),
        exhausted: new FXSignal(),
        effectSpawned: new FXSignal(),
        triggerActivated: new FXSignal(),
    };

    constructor(componentId: string) {
        super(componentId);
    }

    // *********************************************************************************************
    // * Public																			                                        		   *
    // *********************************************************************************************
    public init(container: Container, delay: number = 0, autoStart: boolean = true, scaleMod: number = 1): EffectSequence {
        this.container = container;
        this._scaleMod = scaleMod;
        this._delay = delay * 1000;
        if (autoStart) { this.start(); }
        return this;
    }

    public start(): EffectSequence {
        if (this._active) { return; }

        this._startTime = Date.now() + (this.settings.delay ? this.settings.delay * 1000 : 0) + this._delay;
        this._index = 0;

        if (this._list.length === 0) {
            this._active = false;
            if (this.__on.exhausted.__hasCallback) {
                this.__on.exhausted.dispatch(this);
            }
            if (this.__on.completed.__hasCallback) {
                this.__on.completed.dispatch(this);
            }
            this.recycle();
            return this;
        }

        this.exhausted = this.completed = false;

        this.setNextEffect();

        this.__fx.effectSequenceCount++;
        this.__fx.__addActiveEffect(this);

        if (this.__on.started.__hasCallback) {
            this.__on.started.dispatch(this);
        }
        return this;
    }

    public update(dt: number) {
        const t = Date.now();
        if (t < this._startTime) { return; }
        this._time += dt;

        if (!this.exhausted && t >= this._effectStartTime) {
            const fx = this.__fx;
            const def = this._nextEffectSettings;
            let effect: Sprite | MovieClip | ParticleEmitter;
            let node;
            let container;

            switch (def.componentType) {
                case FX.EffectSequenceComponentType.Sprite:
                    effect = fx.__getSprite(def.componentId);
                    container = fx.__containers[def.containerId] || this.container;
                    container.addChild(effect as Sprite);
                    (effect as Sprite).blendMode = fx.useBlendModes ? def.blendMode : 0;
                    (effect as Sprite).tint = def.tint;
                    (effect as Sprite).scale.set(Rnd.float(def.scaleMin, def.scaleMax) * Rnd.float(this.settings.scaleMin, this.settings.scaleMax) * this._scaleMod);
                    (effect as Sprite).alpha = Rnd.float(def.alphaMin, def.alphaMax);
                    (effect as Sprite).anchor.set(def.componentParams.anchorX, def.componentParams.anchorY);

                    node = new Node({ component: effect, endTime: t + (def.duration) * 1000 });
                    this._elements.add(node);
                    effect.x = this._x;
                    effect.y = this._y;
                    effect.rotation = this._rotation + Rnd.float(def.rotationMin, def.rotationMax);
                    if (this.__on.effectSpawned.__hasCallback) {
                        this.__on.effectSpawned.dispatch(FX.EffectSequenceComponentType.Sprite, effect);
                    }
                    break;

                case FX.EffectSequenceComponentType.MovieClip:
                    effect = fx.__getMovieClip(def.componentId);
                    if ((def.componentParams as IMovieClipComponentParams).loop) {
                        (effect as MovieClip).animationSpeed = Rnd.float((def.componentParams as IMovieClipComponentParams).animationSpeedMin || 1, (def.componentParams as IMovieClipComponentParams).animationSpeedMax || 1);
                        (effect as MovieClip).loop = (def.componentParams as IMovieClipComponentParams).loop || false;
                    } else {
                        const speed = def.duration;
                    }

                    (effect as MovieClip).anchor.set(def.componentParams.anchorX, def.componentParams.anchorY);

                    (effect as MovieClip).gotoAndPlay(0);
                    container = fx.__containers[def.containerId] || this.container;
                    container.addChild(effect as MovieClip);
                    (effect as MovieClip).blendMode = fx.useBlendModes ? def.blendMode : 0;
                    (effect as MovieClip).tint = def.tint;
                    (effect as MovieClip).scale.set(Rnd.float(def.scaleMin, def.scaleMax) * Rnd.float(this.settings.scaleMin, this.settings.scaleMax) * this._scaleMod);
                    (effect as MovieClip).alpha = Rnd.float(def.alphaMin, def.alphaMax);

                    node = new Node({ component: effect, endTime: t + (def.duration) * 1000 });
                    this._elements.add(node);
                    effect.x = this._x;
                    effect.y = this._y;
                    effect.rotation = this._rotation + Rnd.float(def.rotationMin, def.rotationMax);
                    if (this.__on.effectSpawned.__hasCallback) {
                        this.__on.effectSpawned.dispatch(FX.EffectSequenceComponentType.MovieClip, effect);
                    }
                    break;

                case FX.EffectSequenceComponentType.Emitter:
                    effect = fx.getParticleEmitterById(def.componentId);
                    container = fx.__containers[def.containerId] || this.container;
                    (effect as ParticleEmitter).init(container, true, Rnd.float(def.scaleMin, def.scaleMax) * Rnd.float(this.settings.scaleMin, this.settings.scaleMax) * this._scaleMod);
                    node = new Node({ component: effect, endTime: (effect as ParticleEmitter).endTime });
                    this._elements.add(node);
                    effect.x = this._x;
                    effect.y = this._y;
                    effect.rotation = this._rotation + effect.settings.rotation;
                    if (this.__on.effectSpawned.__hasCallback) {
                        this.__on.effectSpawned.dispatch(FX.EffectSequenceComponentType.Emitter, effect);
                    }
                    break;

                case FX.EffectSequenceComponentType.Trigger:
                    if (this.__on.triggerActivated.__hasCallback) {
                        this.__on.triggerActivated.dispatch(def.triggerValue);
                    }
                    break;
            }

            if (this._index === this._list.length) {
                this.exhausted = true;
                if (this.__on.exhausted.__hasCallback) {
                    this.__on.exhausted.dispatch(this);
                }
            } else {
                this.setNextEffect();
            }
        }

        const list = this._elements;
        let node = list.first;
        while (node) {
            node.update(dt);
            if (t > node.data.endTime) {
                const component = node.data.component;
                if (component instanceof ParticleEmitter) {
                    if (component.completed) {
                        list.remove(node);
                    }
                } else {
                    list.remove(node);
                    component.recycle();
                }
            }
            node = node.next;
        }
        if (this.exhausted && list.length === 0) {
            this._active = false;
            this.completed = true;
            if (this.__on.completed.__hasCallback) {
                this.__on.completed.dispatch(this);
            }
            this.recycle();
        }
    }

    public stop() {
        this.recycle();
    }

    public recycle() {
        if (this.__recycled) { return; }
        const list = this._elements;
        let node = list.first;
        let next;
        while (node) {
            next = node.next;
            node.data.component.recycle();
            node = next;
        }

        const on = this.__on;
        if (on.completed.__hasCallback) { on.completed.removeAll(); }
        if (on.started.__hasCallback) { on.started.removeAll(); }
        if (on.exhausted.__hasCallback) { on.exhausted.removeAll(); }
        if (on.effectSpawned.__hasCallback) { on.effectSpawned.removeAll(); }
        if (on.triggerActivated.__hasCallback) { on.triggerActivated.removeAll(); }

        list.clear();
        this.__recycled = true;
        this._x = this._y = this._rotation = 0;
        this.__fx.effectSequenceCount--;
        this.__fx.__recycleEffectSequence(this);
    }

    public dispose() {
        this._elements.clear();
        this.__fx = null;
        const on = this.__on;
        on.completed = on.started = on.exhausted = on.effectSpawned = on.triggerActivated = null;
    }

    public set rotation(value: number) {
        this._rotation = value;
        const list = this._elements;
        let node = list.first;
        let next;
        while (node) {
            next = node.next;
            node.data.rotation = value;
            node = next;
        }
    }

    public get x(): number {
        return this._x;
    }

    public set x(value: number) {
        this._x = value;
        const list = this._elements;
        let node = list.first;
        let next;
        while (node) {
            next = node.next;
            node.data.x = value;
            node = next;
        }
    }

    public get y(): number {
        return this._y;
    }

    public set y(value: number) {
        this._y = value;
        const list = this._elements;
        let node = list.first;
        let next;
        while (node) {
            next = node.next;
            node.data.y = value;
            node = next;
        }
    }

    public get rotation(): number {
        return this._rotation;
    }

    public get on(): IEffectSequenceSignals {
        return this.__on;
    }

    // *********************************************************************************************
    // * Private																		           *                              		   *
    // *********************************************************************************************

    private setNextEffect() {
        if (this.exhausted) { return; }
        const def = this._nextEffectSettings = this._list[this._index++];
        this._effectStartTime = this._startTime + def.delay * 1000;
    }

    // *********************************************************************************************
    // * Internal																		           *                              		   *
    // *********************************************************************************************
    public __applySettings(value: IEffectSequenceSettings) {
        this.settings = value;
        this.name = value.name;
        this._list = value.effects.slice();
        this.__recycled = false;
    }
}
