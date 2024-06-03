import { store } from './store/store.js';
import { treeActions } from './store/tree/tree.js'
import { cacheTreeActions } from './store/tree/cacheTree.js'

function getTree() {
    store.dispatch(treeActions.fetch());
    fetch('/api/nodes')
        .then(data => data.json(), (error) => { throw new Error(error) })
        .then(data => store.dispatch(treeActions.fetchSuccess([data])))
        .catch((e) => store.dispatch(treeActions.fetchError(e)))
}

const dbTree = document.querySelector('.db')
const subscription = store.subscribe(({ tree }) => {
    console.log({ db: tree.tree })
    dbTree.isLoading = tree.isLoading;
    dbTree.data = tree.tree;
    dbTree.error = tree.error;
});

getTree();