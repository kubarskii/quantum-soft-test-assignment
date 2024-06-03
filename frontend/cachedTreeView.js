import { store } from './store/store.js';
import { cacheTreeActions } from './store/tree/cacheTree.js'

const cacheTree = document.querySelector('.cache');
const dbTree = document.querySelector('.db')
const addToCacheButton = document.querySelector('.add-node-to-cache')

const getById = (id) => {
    store.dispatch(cacheTreeActions.fetch());
    fetch(`/api/nodes/${id}`)
        .then(data => data.json(), (error) => { throw new Error(error) })
        .then(data => store.dispatch(cacheTreeActions.addFromDB(data)))
        .catch((e) => store.dispatch(cacheTreeActions.fetchError(e)))
}

let currentSelectedId;

dbTree.onSelect = (id) => currentSelectedId = id;
cacheTree.isEditable = true
cacheTree.onEdit = (id, value) => {
    console.log(id, value)
}

addToCacheButton.addEventListener('click', () => {
    if (currentSelectedId) getById(currentSelectedId);
})

const subscription = store.subscribe(({ cache }) => {
    cacheTree.isLoading = cache.isLoading;
    const treeValue = cache.tree.toJSON();
    console.log({ cache: treeValue })
    cacheTree.data = treeValue;
});

