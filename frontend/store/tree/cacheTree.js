import Tree from '../../lib/tree.js'

const actionTypes = {
    ADD_ITEM_FROM_DB: 'ADD_ITEM_FROM_DB',
    REMOVE_ADDED_ITEM: 'REMOVE_ADDED_ITEM',
    CHANGE_VALUE: 'CHANGE_VALUE',
    REMOVE_VALUE: 'REMOVE_VALUE',
    ADD_VALUE: 'ADD_VALUE',
    FETCH_TREE_ITEM_INIT: 'FETCH_ITEM',
    FETCH_TREE_ITEM_SUCCESS: 'FETCH_TREE_ITEM_SUCCESS',
    FETCH_TREE_ITEM_ERROR: 'FETCH_TREE_ITEM_ERROR',
    // step back
    REVERT_CACHE: 'REVERT_CACHE',
    // reset to default
    RESET_CACHE: 'RESET_CACHE',
    APPLY_CHANGE: 'APPLY_CHANGE',
}
export const cacheTreeActions = {
    addFromDB: (payload) => ({ type: actionTypes.ADD_ITEM_FROM_DB, payload }),
    removeAddedItem: (payload) => ({ type: actionTypes.REMOVE_ADDED_ITEM, payload }),
    changeValue: (payload) => ({ type: actionTypes.CHANGE_VALUE, payload }),
    removeValue: (payload) => ({ type: actionTypes.REMOVE_VALUE, payload }),
    fetch: () => ({ type: actionTypes.FETCH_TREE_ITEM_INIT }),
    addValue: (payload) => ({ type: actionTypes.ADD_VALUE, payload }),
    fetchError: (payload) => ({ type: actionTypes.FETCH_TREE_ITEM_ERROR, payload }),
    revert: () => ({ type: actionTypes.REVERT_CACHE }),
    reset: () => ({ type: actionTypes.RESET_CACHE }),
    apply: () => ({ type: actionTypes.APPLY_CHANGE }),
}

const initialState = {
    tree: new Tree(),
    transactions: [],
    isLoading: false,
    error: null,
}

export const cacheTreeReducer = (state = initialState, action) => {
    const { type, payload } = action;
    switch (type) {
        case (actionTypes.FETCH_TREE_ITEM_INIT): {
            return { ...state, isLoading: true, error: null };
        }
        case (actionTypes.FETCH_TREE_ITEM_ERROR): {
            return { ...state, isLoading: false, error: payload };
        }
        case (actionTypes.ADD_ITEM_FROM_DB): {
            const { value, parentId, id, isDeleted } = payload;
            if (!isDeleted)
                state.tree.addNode(value, parentId, id);
            return { ...state, isLoading: false };
        }
        case (actionTypes.REMOVE_ADDED_ITEM): {
            const { id } = payload;
            state.tree.deleteNode(id);
            return state;
        }
        case (actionTypes.CHANGE_VALUE): {
            const { id, value } = payload;
            state.tree.changeValue(id, value);
            state.transactions.push(action)
            return state;
        }
        case (actionTypes.REMOVE_VALUE): {
            const { id } = payload;
            state.tree.deleteNode(id);
            state.transactions.push(action)
            return state;
        }
        case (actionTypes.ADD_VALUE): {
            const { value, parentId, id } = payload;
            state.tree.addNode(value, parentId, id);
            state.transactions.push(action)
            return state;
        }
        case (actionTypes.RESET_CACHE): {
            return {
                ...state,
                tree: new Tree(),
                transactions: [],
            }
        }
        case (actionTypes.APPLY_CHANGE): {
            return {
                ...state,
                transactions: [],
            }
        }
        default: {
            return state
        }
    }
} 