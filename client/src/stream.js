// @flow

import EventEmitter from 'events';

class Stream extends EventEmitter {
    queue: Array<Object>;

    constructor() {
        super();
        this.queue = [];
    }

    submit(v: Object) {
        this.queue.push(v);
        this.emit('message', v);
    }

    take() {
        return this.queue.shift();
    }
}

export default Stream;
