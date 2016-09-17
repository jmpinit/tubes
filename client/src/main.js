import h from 'virtual-dom/h';
import diff from 'virtual-dom/diff';
import patch from 'virtual-dom/patch';
import createElement from 'virtual-dom/create-element';

import * as frp from './frp';
import Graph from './graph';

// TODO exclusively use messages to affect the UI so update need not be called

const namespace = 'http://www.w3.org/2000/svg';

const theGraph = new Graph();

let connecting = false;
let currentNodeType = 'input';

function clickOnGeometry(event) {
    if (currentNodeType && !connecting) {
        const rect = this.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        theGraph.addNode(currentNodeType, x, y);
    }

    // FIXME with messages
    update();
}

function chooseNodeType(type) {
    return () => {
        currentNodeType = type;
    };
}

let tree = render(theGraph);
let rootNode = createElement(tree);

document.body.appendChild(rootNode);

function update() {
    const newTree = render(theGraph);
    const patches = diff(tree, newTree);
    rootNode = patch(rootNode, patches);
    tree = newTree;
}

function render(graph) {
    const nodes = graph.elements.map(n => n.render());

    nodes.push(h('defs', {}, [
        h('marker', {
            namespace,
            attributes: {
                id: 'triangle',
                viewBox: '0 0 10 10',
                refX: '1',
                refY: '5',
                markerWidth: '6',
                markerHeight: '6',
                orient: 'auto',
            },
        }, [
            h('path', {
                namespace,
                attributes: {
                    d: 'M 0 0 L 10 5 L 0 10 z',
                },
            }),
        ]),
    ]));

    const connectingButton = h('button', {
        name: 'set-connecting',
        onclick: () => {
            connecting = !connecting;
            update();
        },
    }, 'connect');

    const typeRadios = Object.keys(theGraph.nodeTypes).map(nodeType => h('div', {}, [
        h('input', {
            name: 'nodeType',
            type: 'radio',
            checked: currentNodeType === nodeType ? 'true' : undefined,
            onclick: chooseNodeType(nodeType),
        }),
        h('label', {}, nodeType),
        h('br'),
    ]));

    const html = h('div', {}, [connectingButton, ...typeRadios]);

    const geometry = h('svg', {
        namespace,
        onclick: clickOnGeometry,
        attributes: {
            width: window.innerWidth,
            height: window.innerHeight,
        },
    }, nodes);

    return h('div', {}, [html, geometry]);
}

// wire in updates
window.onresize = () => update();
theGraph.on('change', () => update());
update();

// UI
