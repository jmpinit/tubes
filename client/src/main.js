// @flow

import h from 'virtual-dom/h';
import diff from 'virtual-dom/diff';
import patch from 'virtual-dom/patch';
import createElement from 'virtual-dom/create-element';
import { createStore } from 'redux';

import reducer from './reducers';
import { VectorCanvas, Node, Edge, ToolBar, Defs } from './components';
import hsvg from './hsvg';

const store = createStore(reducer);

function render(app) {
    const toolBarElement = new ToolBar(store, {
        tools: ['select', 'node', 'connect', 'delete'],
        tool: app.tool,
    });
    const nodeElements = app.nodes.map(node => new Node(store, node)).map(n => n.render());
    const edgeElements = app.edges.map(edge => new Edge(store, edge)).map(e => e.render());

    const svg = new VectorCanvas(store, {
        children: [(new Defs(store)).render(), toolBarElement.render(), edgeElements, nodeElements],
        width: app.width,
        height: app.height,
    });

    return h('div', {}, [svg.render()]);
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

function onkeypress(event) {
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
            store.dispatch({ type: 'SWITCH_TOOL', tool: 'connect' });
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
}

document.onkeypress = onkeypress;
