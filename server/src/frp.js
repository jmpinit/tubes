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
    inputs: Array<Object>;
    fn: Function;

    constructor(inputStreams: Array<Object>, fn: Function) {
        super();

        this.inputs = inputStreams.map(s => ({ changed: false, stream: s }));
        this.fn = fn;

        const maybeEmit = () => {
            const unchanged = this.inputs.filter(input => !input.changed);

            // don't emit unless all inputs have changed
            if (unchanged.length > 0) {
                return;
            }

            const values = this.inputs.map(input => input.stream.take());
            const newOutput = this.fn.apply({}, values);
            this.output.submit(newOutput);
        };

        // listen to our inputs
        this.inputs.forEach(input => input.stream.on('message', () => {
            // eslint-disable-next-line no-param-reassign
            input.changed = true;
            maybeEmit();
        }));
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
