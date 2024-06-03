import Store from "../lib/store.js";
import { treeReducer } from './tree/tree.js'
import { cacheTreeReducer } from './tree/cacheTree.js'

export const rootReducer = Store.combineReducers({
    tree: treeReducer,
    cache: cacheTreeReducer
});