/*
function clickNode(store, id) {
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

function resize(store) {
    store.dispatch({
        type: 'RESIZE',
        width: window.innerWidth,
        height: window.innerHeight,
    });
}

function onkeypress(store, event) {
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
}

function switchTool(store, toolType) {
    return (event) => {
        event.stopPropagation();
        store.dispatch({ type: 'SWITCH_TOOL', tool: toolType });
    };
}

let nameCode = 65;
function addNode(store, event) {
    const box = this.getBoundingClientRect();
    const x = event.pageX - box.left;
    const y = event.pageY - box.top;

    const name = String.fromCharCode(nameCode);
    nameCode += 1;

    store.dispatch({ type: 'ADD_NODE', name, x, y });
}

function click(store, event) {
    const { app } = store.getState();

    switch (app.tool) {
        case 'node':
            addNode.apply(this, event);
            return;
        default:
            return;
    }
}

export { click, addNode, switchTool, clickNode, resize, onkeypress };
*/
