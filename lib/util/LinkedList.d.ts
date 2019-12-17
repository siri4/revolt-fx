export declare class LinkedList<N extends Node = Node> {
    __length: number;
    first: N;
    last: N;
    constructor();
    get length(): number;
    add(node: N): LinkedList;
    remove(node: N): LinkedList;
    clear(): void;
    toArray(): N[];
}
export declare class Node<D = any> {
    data?: D;
    next: this;
    prev: this;
    list: LinkedList;
    constructor(data?: D);
    update(dt: number): void;
    dispose(): void;
}
