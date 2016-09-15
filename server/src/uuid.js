// @flow

class UUIDGen {
    counter: number;

    constructor() {
        this.counter = 0;
    }

    next(): string {
        const uuid = this.counter.toString();
        this.counter += 1;
        return uuid;
    }
}

export default UUIDGen;
