// @flow

import h from 'virtual-dom/h';
import diff from 'virtual-dom/diff';
import patch from 'virtual-dom/patch';
import createElement from 'virtual-dom/create-element';
import { createStore } from 'redux';

import reducer from './reducers';
import { VectorCanvas, Editor, Node, Edge, ToolBar, Defs } from './components';
import hsvg from './hsvg';

// TODO needs better management
const socket = new WebSocket('ws://localhost:1337');

let connected = false;
socket.onmessage = ({ data: message }) => {
    try {
        const action = JSON.parse(message.toString());
        store.dispatch(action);
        console.log(action);
    } catch(e) {
        console.error(e);
    }

    if (!connected) {
        console.log('connected!');
        connected = true;
    }
}

const store = createStore(reducer);

function render(app) {
    const children = [];

    const toolBarElement = new ToolBar(store, {
        tools: ['select', 'node', 'connect', 'code', 'delete'],
        tool: app.tool,
    });
    const nodeElements = app.nodes.map(node => new Node(store, node)).map(n => n.render());
    const edgeElements = app.edges.map(edge => new Edge(store, edge)).map(e => e.render());

    const svg = new VectorCanvas(store, {
        children: [(new Defs(store)).render(), toolBarElement.render(), edgeElements, nodeElements],
        width: app.width,
        height: app.height,
    });

    children.push(svg.render());

    if (app.editor) {
        children.push((new Editor(store, app.editor)).render());
    }

    return h('div', {}, children);
}

let tree = h('div');
let rootNode = createElement(tree);
document.body.appendChild(rootNode);

store.subscribe(() => {
    const newTree = render(store.getState());
    const patches = diff(tree, newTree);
    rootNode = patch(rootNode, patches);
    tree = newTree;
});

// makes a blob of JSON describing the current graph
function serialize() {
    const app = store.getState();

    const stripEdge = ({ id, start, end }) => ({
        id,
        start: stripNode(start),
        end: stripNode(end),
    });

    const stripNode = ({ name, id, shape }) => ({ name, id, shape });

    const graphData = {
        edges: app.edges.map(e => stripEdge(e)),
        sourceCode: app.sourceCode,
    };

    socket.send(JSON.stringify(graphData));
}

// TOP-LEVEL EVENT HANDLERS

function resize() {
    store.dispatch({
        type: 'RESIZE',
        width: window.innerWidth,
        height: window.innerHeight,
    });
}

window.onresize = resize();
resize();

document.onkeyup = function(event) {
    if (event.key === 'Escape') {
        const code = document.editor.getValue();
        store.dispatch({ type: 'CLOSE_EDITOR', code });
        event.stopPropagation();
    }
}

function onkeypress(event) {
    if (event.target.className === 'ace_text-input') {
        // FIXME directly prevent ace from propagating events
        // (or remove ace entirely - is text editing necessary here?)
        return;
    }

    switch (event.key) {
        case 'z': {
            console.log(serialize());
        }
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
        case 'c': {
            store.dispatch({ type: 'SWITCH_TOOL', tool: 'connect' });
            event.stopPropagation();
            return;
        }
        case 'e': {
            store.dispatch({ type: 'SWITCH_TOOL', tool: 'code' });
            event.stopPropagation();
            return;
        }
        case 'd': {
            const selected = store.getState().selected;

            if (selected.length > 0) {
                // delete all selected
                selected.forEach(id => store.dispatch({ type: 'DELETE', id }));
            } else {
                store.dispatch({ type: 'SWITCH_TOOL', tool: 'delete' });
            }
            event.stopPropagation();
            return;
        }
        // node tool
        // TODO manage tool state separately
        case 'i':
        case 'f':
        case 'o': {
            const active = store.getState().tool === 'node';

            if (active) {
                const nodeType = ({
                    i: 'input',
                    f: 'function',
                    o: 'output',
                })[event.key];

                store.dispatch({ type: 'SWITCH_NODE_TYPE', nodeType });
            }
        }
        default: {
            return;
        }
    }
}

document.onkeypress = onkeypress;
