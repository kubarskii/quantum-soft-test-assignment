const actionTypes = {
    FETCH_TREE_INIT: 'FETCH_TREE',
    FETCH_TREE_SUCCESS: 'FETCH_TREE_SUCCESS',
    FETCH_TREE_ERROR: 'FETCH_TREE_ERROR',
}
export const treeActions = {
    fetch: () => ({ type: actionTypes.FETCH_TREE_INIT }),
    fetchSuccess: (payload) => ({ type: actionTypes.FETCH_TREE_SUCCESS, payload }),
    fetchError: (payload) => ({ type: actionTypes.FETCH_TREE_ERROR, payload }),
}

const initialState = {
    tree: {},
    error: null,
    isLoading: false,
}

export const treeReducer = (state = initialState, action) => {
    const { type, payload } = action;
    switch (type) {
        case (actionTypes.FETCH_TREE_INIT): {
            return { ...state, isLoading: true };
        }
        case (actionTypes.FETCH_TREE_SUCCESS): {
            return { ...state, error: null, tree: payload, isLoading: false };
        }
        case (actionTypes.FETCH_TREE_ERROR): {
            return { ...state, error: payload, tree: [], isLoading: false };
        }
        default: {
            return state
        }
    }
} 