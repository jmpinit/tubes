// @flow

import UUIDGen from './uuid';
import Stream from './stream';

const uuid = new UUIDGen();

class Node {
    uuid: string;
    output: Object;

    constructor() {
        this.uuid = uuid.next();
        this.output = new Stream();
    }
}

// TODO multiple inheritance: Node & Stream
class Input extends Stream {
    uuid: string;
    output: Object;
    value: Object;

    constructor(value: Object) {
        super();

        this.value = value;

        this.uuid = uuid.next();
        this.output = new Stream();

        this.on('message', () => this.output.submit(this.take()));
    }
}

class Lift extends Node {
    input: Object;
    fn: Function;

    constructor(input: Object, fn: Function) {
        super();

        this.input = input;
        this.fn = fn;

        this.input.on('message', v => this.output.submit(this.fn(v)));
    }
}

class FoldP extends Node {

}

class Let extends Node {

}

class Var extends Node {

}

class Async extends Node {

}

export { Stream, Input, Lift, FoldP, Let, Var, Async };
