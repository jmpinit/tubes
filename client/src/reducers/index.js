import { combineReducers } from 'redux';
import uid from '../uid';

function nodes(state = [], action) {
    switch (action.type) {
        case 'ADD_NODE': {
            return [...state, {
                name: 'a-node',
                shape: 'box3d',
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

function app(state = { width: 100, height: 100, tool: 'node', selected: [], nodes: [], edges: [] }, action) {
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