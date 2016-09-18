// @flow

import h from 'virtual-dom/h';
import diff from 'virtual-dom/diff';
import patch from 'virtual-dom/patch';
import createElement from 'virtual-dom/create-element';

import { combineReducers, createStore } from 'redux';

// import Graph from './graph';

const namespace = 'http://www.w3.org/2000/svg';
// const theGraph = new Graph();

let counter = 0;
function uid() {
    const id = counter.toString();
    counter += 1;
    return id;
}

function nodes(state = [], action) {
    switch (action.type) {
        case 'ADD_NODE': {
            return [...state, {
                name: 'a-node',
                id: uid(),
                x: action.x || 0,
                y: action.y || 0,
            }];
        }
        case 'DELETE': {
            return state.filter(node => node.id !== action.id)
                .map(node => Object.assign({}, node));
        }
        default: {
            return [...state];
        }
    }
}

function connections(state = { edges: [] }, action) {
    switch (action.type) {
        case 'DELETE': {
            return {
                ...state,
                edges: state.edges.filter(edge => (
                    edge.start !== action.id && edge.end !== action.id
                )),
            };
        }
        case 'EDGE_NODE': {
            if (!state.start) {
                return {
                    ...state,
                    start: action.id,
                };
            }

            const newEdge = {
                id: uid(),
                start: state.start,
                end: action.id,
            };

            return {
                ...state,
                start: undefined,
                edges: [...state.edges, newEdge],
            };
        }
        default: {
            return state;
        }
    }
}

function app(state = { width: 100, height: 100, tool: 'node', selected: [] }, action) {
    switch (action.type) {
        case 'SWITCH_TOOL': {
            return { ...state, tool: action.tool };
        }
        case 'SELECT': {
            return {
                ...state,
                selected: [...state.selected, action.id],
            };
        }
        case 'SELECT_NONE': {
            return {
                ...state,
                selected: [],
            };
        }
        case 'RESIZE': {
            return {
                ...state,
                width: action.width,
                height: action.height,
            };
        }
        default: {
            return Object.assign({}, state);
        }
    }
}

let tree = h('div');
let rootNode = createElement(tree);
document.body.appendChild(rootNode);

const reducer = combineReducers({ app, nodes, connections });
const store = createStore(reducer);

store.subscribe(() => {
    const newTree = render(store.getState());
    const patches = diff(tree, newTree);
    rootNode = patch(rootNode, patches);
    tree = newTree;
});

function resize() {
    store.dispatch({
        type: 'RESIZE',
        width: window.innerWidth,
        height: window.innerHeight,
    });
}
window.onresize = resize;
resize();

document.onkeypress = (event) => {
    switch (event.key) {
        case ' ': {
            store.dispatch({ type: 'SELECT_NONE' });
            event.stopPropagation();
            return;
        }
        case 's': {
            store.dispatch({ type: 'SWITCH_TOOL', tool: 'select' });
            event.stopPropagation();
            return;
        }
        case 'n': {
            store.dispatch({ type: 'SWITCH_TOOL', tool: 'node' });
            event.stopPropagation();
            return;
        }
        case 'e': {
            store.dispatch({ type: 'SWITCH_TOOL', tool: 'edge' });
            event.stopPropagation();
            return;
        }
        case 'd': {
            store.dispatch({ type: 'SWITCH_TOOL', tool: 'delete' });
            event.stopPropagation();
            return;
        }
        default: {
            return;
        }
    }
};

function clickNode(id) {
    const { app, connections } = store.getState();

    return () => {
        switch (app.tool) {
            case 'select':
                store.dispatch({ type: 'SELECT', id });
                return;
            case 'delete':
                store.dispatch({ type: 'DELETE', id });
                return;
            case 'edge':
                if (connections.start) {
                    store.dispatch({ type: 'SELECT_NONE' });
                } else {
                    store.dispatch({ type: 'SELECT', id });
                }

                store.dispatch({ type: 'EDGE_NODE', id });
                return;
            default:
                return;
        }
    };
}

function Node({ selected }, { name, x, y, id }) {
    const isSelected = (selected.indexOf(id) !== -1);

    return h('use', {
        namespace,
        onclick: clickNode(id),
        attributes: {
            transform: `translate(${x},${y})`,
            href: '#box3d',
        },
    });
    /*h('circle', {
        namespace,
        onclick: clickNode(id),
        attributes: {
            id: name,
            class: isSelected ? 'selected node' : 'node',
            transform: `translate(${x},${y})`,
            r: 10,
        },
    });*/
}

function Edge(nodes, { name, start: startId, end: endId }) {
    const start = nodes.filter(n => n.id === startId)[0];
    const end = nodes.filter(n => n.id === endId)[0];

    const mid = {
        x: start.x + ((end.x - start.x) / 2),
        y: start.y + ((end.y - start.y) / 2),
    };

    return h('path', {
        namespace,
        attributes: {
            id: name,
            class: 'edge',
            d: `M${start.x},${start.y} L${mid.x},${mid.y} L${end.x},${end.y}`,
            'marker-mid': 'url(#triangle)',
        },
    });
}

function Defs() {
    return h('defs', { namespace }, [
        h('g', { namespace, attributes: { id: 'box3d' } }, [
            h('path', {
                namespace,
                attributes: {
                    style: 'fill: white; stroke: none',
                    d: 'M-10,-2.5 L0,-12.5 L10,-2.5 L10,7.5 L0,17.5 L-10,7.5, L-10,-2.5 z',
                },
            }),
            h('path', {
                namespace,
                attributes: {
                    class: 'outline',
                    style: 'fill: none; stroke-linejoin: round',
                    d: 'M-10,-2.5 L0,-12.5 L10,-2.5 L0,7.5 L-10,-2.5 L-10,7.5 L0,17.5 L10,7.5, L10,-2.5 M0,7.5 L0,17.5',
                },
            }),
        ]),
        h('marker', {
            namespace,
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
            h('path', {
                namespace,
                attributes: {
                    style: 'stroke: none',
                    d: 'M 0 0 L 10 5 L 0 10 z',
                },
            }),
        ]),
    ]);
}

function switchTool(toolType) {
    return (event) => {
        event.stopPropagation();
        store.dispatch({ type: 'SWITCH_TOOL', tool: toolType });
    };
}

function ToolBar({ tool }) {
    const size = 32;
    const off = { x: 10, y: 10 };
    const tools = ['select', 'node', 'edge', 'delete'];

    return h('g', {
        namespace,
        attributes: { class: 'toolbar' },
    },
    tools.map((toolType, i) => (
        h('g', {
            namespace,
            onclick: switchTool(toolType),
        }, [
            h('rect', {
                namespace,
                attributes: {
                    x: off.x + (size * i),
                    y: off.y,
                    width: size,
                    height: size,
                    rx: size / 4,
                    ry: size / 4,
                    fill: toolType === tool ? 'gray' : 'white',
                },
            }),
            h('text', {
                namespace,
                attributes: {
                    x: off.x + (size * i) + (size / 2),
                    y: off.y + (size / 2),
                    'font-family': 'sans-serif',
                    'font-size': 10,
                    'text-anchor': 'middle',
                    'alignment-baseline': 'central',
                },
            }, toolType),
        ])
    )));
}

let nameCode = 65;
function addNode(event) {
    const box = this.getBoundingClientRect();
    const x = event.pageX - box.left;
    const y = event.pageY - box.top;

    const name = String.fromCharCode(nameCode);
    nameCode += 1;

    store.dispatch({ type: 'ADD_NODE', name, x, y });
}

function click(event) {
    const { app } = store.getState();

    switch (app.tool) {
        case 'node':
            addNode.apply(this, arguments);
            return;
        default:
            return;
    }
}

function render({ app, nodes, connections }) {
    const toolBarElement = ToolBar(app);
    const nodeElements = nodes.map(node => Node(app, node));
    const edgeElements = connections.edges.map(edge => Edge(nodes, edge));

    const svg = h('svg', {
        namespace,
        onclick: click,
        attributes: {
            width: app.width,
            height: app.height,
        },
    }, [Defs(), toolBarElement, edgeElements, nodeElements]);

    return h('div', {}, [svg]);
}
