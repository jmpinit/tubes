// @flow

import hsvg from '../hsvg';
import handlers from '../event-handlers';

// TODO use "app" everywhere "state" is used

class Component {
    store: Object;

    constructor(store: Object) {
        this.store = store;
    }

    // abstract render()
}

class VectorCanvas extends Component {
    children: Array<Object>;
    width: number;
    height: number;

    constructor(store: Object, opts: Object) {
        super(store);

        this.width = opts.width || 0;
        this.height = opts.height || 0;
        this.children = opts.children || [];
    }

    handleClick(event: Object) {
        const app = this.store.getState();

        switch (app.tool) {
            case 'node': {
                const box = event.target.getBoundingClientRect();
                const x = event.pageX - box.left;
                const y = event.pageY - box.top;

                const nameCode = 65 + app.nodes.length;
                const name = String.fromCharCode(nameCode);

                this.store.dispatch({ type: 'ADD_NODE', name, x, y, nodeType: app.nodeType });

                return;
            }
            default:
                return;
        }
    }

    render() {
        return hsvg('svg', {
            onclick: this.handleClick.bind(this),
            attributes: {
                width: this.width,
                height: this.height,
            },
        }, this.children);
    }
}

class Node extends Component {
    id: string;
    x: number;
    y: number;
    shape: string;

    constructor(store: Object, opts: Object) {
        super(store);

        this.id = opts.id;
        this.x = opts.x || 0;
        this.y = opts.y || 0;
        this.shape = opts.shape || '';
    }

    handleClick(event: Object) {
        const app = this.store.getState();

        switch (app.tool) {
            case 'select':
                this.store.dispatch({ type: 'SELECT', id: this.id });
                event.stopPropagation();
                return;
            case 'delete':
                this.store.dispatch({ type: 'DELETE', id: this.id });
                event.stopPropagation();
                return;
            case 'connect':
                if (app.start) {
                    this.store.dispatch({ type: 'SELECT_NONE' });
                } else {
                    this.store.dispatch({ type: 'SELECT', id: this.id });
                }

                this.store.dispatch({ type: 'CONNECT', id: this.id });
                event.stopPropagation();
                return;
            default:
                event.stopPropagation();
                return;
        }
    }

    render() {
        const state = this.store.getState();
        const isSelected = state.selected.indexOf(this.id) !== -1;

        const decorators = [];

        if (isSelected) {
            decorators.push(hsvg('circle', {
                attributes: {
                    class: 'selector',
                    transform: `translate(${this.x},${this.y + 2.5})`,
                    r: 20,
                },
            }));
        }

        return hsvg('g', {}, [
            ...decorators,
            hsvg('use', {
                onclick: this.handleClick.bind(this),
                attributes: {
                    href: `#${this.shape}`,
                    transform: `translate(${this.x},${this.y})`,
                },
            }),
        ]);
    }
}

class Edge extends Component {
    start: Object;
    end: Object;

    constructor(store: Object, opts: Object) {
        super(store)

        this.start = opts.start;
        this.end = opts.end;
    }

    render() {
        const mid = {
            x: this.start.x + ((this.end.x - this.start.x) / 2),
            y: this.start.y + ((this.end.y - this.start.y) / 2),
        };

        return hsvg('path', {
            attributes: {
                class: 'edge',
                d: `M${this.start.x},${this.start.y} L${mid.x},${mid.y} L${this.end.x},${this.end.y}`,
                'marker-mid': 'url(#triangle)',
            },
        });
    }
}

class ToolBar extends Component {
    currentTool: string;
    size: number;
    offset: Object;
    tools: Array<string>;

    constructor(store: Object, opts: Object) {
        super(store);

        this.currentTool = opts.tool;
        this.tools = opts.tools || [];//['select', 'node', 'edge', 'delete'];

        this.size = 48;
        this.offset = { x: 10, y: 10 };
    }

    handleClick(tool: string) {
        return (event: Object) => {
            event.stopPropagation();
            this.store.dispatch({ type: 'SWITCH_TOOL', tool });
        };
    }

    renderNodeDropdown() {
        const nodeTypes = ['input', 'function', 'output'];

        const entries = nodeTypes.map((type, i) => {
            const state = this.store.getState();
            const selected = state.nodeType === type;
            const y = this.size / 2 * i;

            return hsvg('g', {
                attributes: {
                    class: 'dropdown',
                    transform: `translate(0,${y})`,
                    class: selected ? 'selected' : '',
                }
            }, [
                hsvg('rect', {
                    attributes: {
                        width: this.size,
                        height: this.size / 2,
                        rx: 2,
                        ry: 2,
                    }
                }),
                hsvg('text', {
                    attributes: {
                        transform: `translate(${(this.size / 2)},${(this.size / 4)})`,
                        'font-family': 'sans-serif',
                        'font-size': 10,
                        'text-anchor': 'middle',
                        'alignment-baseline': 'central',
                    }
                }, type),
            ])
        });

        return hsvg('g', {
            attributes: {
                class: 'dropdown',
                transform: `translate(0,${this.size})`,
            }
        }, entries); 
    }

    render() {
        return hsvg('g', {
            attributes: {
                class: 'toolbar',
                transform: `translate(${this.offset.x},${this.offset.y})`,
            },
        },
        this.tools.map((tool, i) => {
            const selected = this.currentTool === tool;
            const left = this.size * i;
            const top = 0;

            const dropdowns = [];

            if (this.currentTool === tool && tool === 'node') {
                dropdowns.push(this.renderNodeDropdown());
            }

            return hsvg('g', {
                onclick: this.handleClick(tool).bind(this),
                attributes: {
                    transform: `translate(${left},${top})`,
                },
            }, [
                hsvg('rect', {
                    attributes: {
                        x: 0,
                        y: 0,
                        width: this.size,
                        height: this.size,
                        rx: selected ? 2 : this.size / 4,
                        ry: selected ? 2 : this.size / 4,
                        class: selected ? 'selected' : '',
                    },
                }),
                hsvg('text', {
                    attributes: {
                        transform: `translate(${(this.size / 2)},${(this.size / 2)})`,
                        'font-family': 'sans-serif',
                        'font-size': 10,
                        'text-anchor': 'middle',
                        'alignment-baseline': 'central',
                    }
                }, tool),
                ...dropdowns,
            ])
        }));
    }
}

class Defs extends Component {
    render() {
        return hsvg('defs', {}, [
            hsvg('g', { attributes: { id: 'input' } }, [
                hsvg('path', {
                    attributes: {
                        class: 'bg',
                        style: 'stroke: none',
                        d: 'M-10,5 A5,2.5,0,0,0,10,5 L0,-7.5 L-10,5 z',
                    },
                }),
                hsvg('path', {
                    attributes: {
                        class: 'outline',
                        style: 'fill: none; stroke-linejoin: round',
                        d: 'M-10,5 A5,2.5,0,0,0,10,5 L0,-10 L-10,5 z',
                    },
                }),
            ]),
            hsvg('g', { attributes: { id: 'function' } }, [
                hsvg('path', {
                    attributes: {
                        class: 'bg',
                        style: 'stroke: none',
                        d: 'M-10,-2.5 L0,-12.5 L10,-2.5 L10,7.5 L0,17.5 L-10,7.5, L-10,-2.5 z',
                    },
                }),
                hsvg('path', {
                    attributes: {
                        class: 'outline',
                        style: 'fill: none; stroke-linejoin: round',
                        d: 'M-10,-2.5 L0,-12.5 L10,-2.5 L0,7.5 L-10,-2.5 L-10,7.5 L0,17.5 L10,7.5, L10,-2.5 M0,7.5 L0,17.5',
                    },
                }),
            ]),
            hsvg('g', { attributes: { id: 'output' } }, [
                hsvg('path', {
                    attributes: {
                        class: 'bg',
                        style: 'stroke: none',
                        d: 'M10,-7.5 A5,2.5,0,0,0,-10,-7.5 M10,-7.5 L0,7.5 L-10,-7.5',
                    },
                }),
                hsvg('path', {
                    attributes: {
                        class: 'outline',
                        style: 'fill: none; stroke-linecap: round; stroke-linejoin: round',
                        d: 'M10,-7.5 A5,2.5,0,0,0,-10,-7.5 A5,2.5,0,0,0,10,-7.5 M10,-6.5 L0,7.5 L-10,-6.5',
                    },
                }),
            ]),
            hsvg('marker', {
                attributes: {
                    id: 'triangle',
                    viewBox: '0 0 10 10',
                    refX: '1',
                    refY: '5',
                    markerWidth: '4',
                    markerHeight: '4',
                    orient: 'auto',
                },
            }, [
                hsvg('path', {
                    attributes: {
                        style: 'stroke: none',
                        d: 'M 0 0 L 10 5 L 0 10 z',
                    },
                }),
            ]),
        ]);
    }
}

export { VectorCanvas, Node, Edge, ToolBar, Defs };
