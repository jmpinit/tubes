import { combineReducers } from 'redux';
import uid from '../uid';

function nodes(state = [], action) {
    switch (action.type) {
        case 'ADD_NODE': {
            return [...state, {
                name: 'a-node',
                shape: action.nodeType,
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

function edges(state = [], action) {
    switch (action.type) {
        case 'DELETE': {
            return state.filter(edge => (
                edge.start.id !== action.id && edge.end.id !== action.id
            ));
        }
        default: {
            return state;
        }
    }
}

function app(state = { width: 100, height: 100, tool: 'node', nodeType: 'input', selected: [], nodes: [], edges: [], sourceCode: {} }, action) {
    switch (action.type) {
        case 'SWITCH_TOOL': {
            return { ...state, tool: action.tool };
        }
        case 'SWITCH_NODE_TYPE': {
            return { ...state, nodeType: action.nodeType };
        }
        case 'SELECT': {
            return {
                ...state,
                selected: [...state.selected, action.id],
            };
        }
        case 'DELETE': {
            // remove any selections that are going to be deleted

            return {
                ...state,
                selected: state.selected.filter(id => id !== action.id),
                nodes: nodes(state.nodes, action),
                edges: edges(state.edges, action),
            };
        }
        case 'CONNECT': {
            if (!state.start) {
                return {
                    ...state,
                    start: action.id,
                };
            }

            const getNode = id => state.nodes.find(n => n.id === id);
            const startNode = getNode(state.start);
            const endNode = getNode(action.id);

            const newEdge = {
                id: uid(),
                start: startNode,
                end: endNode,
            };

            return {
                ...state,
                start: undefined,
                edges: [...state.edges, newEdge],
            };
        }
        case 'OPEN_EDITOR': {
            const { id, x, y } = action;

            if (!(id in state.sourceCode)) {
                return {
                    ...state,
                    editor: { id, x, y },
                    sourceCode: { ...state.sourceCode, [action.id]: '' },
                };
            } else {
                return { ...state, editor: { id, x, y } };
            }
        }
        case 'CLOSE_EDITOR': {
            return { ...state,
                sourceCode: {
                    ...state.sourceCode,
                    [state.editor.id]: action.code,
                },
                editor: undefined,
            }
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
            return {
                ...state,
                nodes: nodes(state.nodes, action),
                edges: edges(state.edges, action),
            };
        }
    }
}

export default app;
