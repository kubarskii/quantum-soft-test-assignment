import { store } from './store/store.js';
import { treeActions } from './store/tree/tree.js'

export function getTree() {
    store.dispatch(treeActions.fetch());
    fetch('/api/nodes')
        .then(data => data.json(), (error) => { throw new Error(error) })
        .then(data => {
            if (!data) return
            store.dispatch(treeActions.fetchSuccess([data]))
        })
        .catch((e) => store.dispatch(treeActions.fetchError(e)))
}

const dbTree = document.querySelector('.db')
const subscription = store.subscribe(({ tree }) => {
    dbTree.isLoading = tree.isLoading;
    dbTree.data = tree.tree;
    dbTree.error = tree.error;
});

getTree();