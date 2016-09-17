// @flow
import EventEmitter from 'events';
import h from 'virtual-dom/h';

const namespace = 'http://www.w3.org/2000/svg';

class Node extends EventEmitter {
    x: number;
    y: number;

    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
    }
}

class Input extends Node {
    radius: number;

    constructor(x, y, r) {
        super(x, y);
        this.radius = r;
    }

    render(): Object {
        return h('circle', {
            namespace,
            onclick: () => this.emit('click'),
            attributes: {
                class: 'input-node',
                transform: `translate(${this.x},${this.y})`,
                r: this.radius,
            },
        });
    }
}

class Lift extends Node {
    radius: number;

    constructor(x, y, r) {
        super(x, y);
        this.radius = r;
    }

    render(): Object {
        return h('circle', {
            namespace,
            attributes: {
                class: 'lift-node',
                transform: `translate(${this.x},${this.y})`,
                r: this.radius,
            },
        });
    }
}

class FoldP extends Node {
    radius: number;

    constructor(x, y, r) {
        super(x, y);
        this.radius = r;
    }

    render(): Object {
        return h('circle', {
            namespace,
            attributes: {
                class: 'foldp-node',
                transform: `translate(${this.x},${this.y})`,
                r: this.radius,
            },
        });
    }
}

class Let extends Node {
    radius: number;

    constructor(x, y, r) {
        super(x, y);
        this.radius = r;
    }

    render(): Object {
        return h('circle', {
            namespace,
            attributes: {
                class: 'let-node',
                transform: `translate(${this.x},${this.y})`,
                r: this.radius,
            },
        });
    }
}

class Edge {
    start: Object;
    end: Object;

    constructor(x1, y1, x2, y2) {
        this.start = { x: x1, y: y1 };
        this.end = { x: x2, y: y2 };
    }

    render() {
        return h('line', {
            namespace,
            attributes: {
                class: 'edge',
                x1: this.start.x,
                y1: this.start.y,
                x2: this.end.x,
                y2: this.end.y,
                'marker-end': 'url(#triangle)',
            },
        });
    }
}

class Graph extends EventEmitter {
    nodeTypes: Object;
    elements: Array<Object>;
    connector: Object;
    first: ?Object;

    constructor() {
        super();

        this.nodeTypes = {
            input: Input,
            lift: Lift,
            foldp: FoldP,
            let: Let,
        };

        this.elements = [];
    }

    addNode(type: string, x: number, y: number) {
        if (!(type in this.nodeTypes)) {
            throw new Error(`Unrecognized node type: ${type}`);
        }

        const newNode = new this.nodeTypes[type](x, y, 10);

        newNode.on('click', () => {
            if (!this.first) {
                this.first = newNode;
            } else {
                const second = newNode;
                this.elements.push(new Edge(this.first.x, this.first.y, second.x, second.y));
                this.first = undefined;
            }
        });

        this.elements.push(newNode);
        this.emit('change');
    }
}

export default Graph;
