import EventEmitter from 'events';

class UUIDGen {
    counter: number;

    constructor() {
        this.counter = 0;
    }

    next() {
        const uuid = this.counter;
        this.counter += 1;
        return uuid;
    }
}

const uuid = new UUIDGen();

class Node {
    uuid: String;

    constructor() {
        this.uuid = uuid.next();
    }
}

class Stream extends EventEmitter {
    queue: Array<Object>;

    constructor() {
        super();
        this.queue = [];
    }

    submit(v: Object) {
        this.queue.push(v);
    }

    take() {
        return this.queue.shift();
    }
}

class Input extends Node {
    inputStream: Object;
    outputStream: Object;

    constructor(input: Object, output: Object, value: Object) {
        super();
        this.inputStream = input;
        this.outputStream = output;

        // this.inputStream.on('message', msg => );
    }
}

class Lift extends Node {

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
