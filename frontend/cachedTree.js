import { store } from './store/store.js';
import { cacheTreeActions } from './store/tree/cacheTree.js'
import { getTree } from './DBTree.js'

const cacheTree = document.querySelector('.cache');
const dbTree = document.querySelector('.db')
const addToCacheButton = document.querySelector('.add-node-to-cache')

const getById = (id) => {
    store.dispatch(cacheTreeActions.fetch());
    fetch(`/api/nodes/${id}`)
        .then(data => data.json(), (error) => { throw new Error(error) })
        .then(data => {
            const state = store.getState();
            const { tree } = state.cache;
            const node = tree.findNode(data.id);
            if (node && !node.isDeleted && data.isDeleted)
                store.dispatch(cacheTreeActions.removeValue({ id: data.id }))
            else
                store.dispatch(cacheTreeActions.addFromDB(data))

        })
        .catch((e) => store.dispatch(cacheTreeActions.fetchError(e)))
}

const applyChangesOnBackend = (changes) => {
    fetch('/api/nodes/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changes })
    })
        .then(data => data.json(), (error) => { throw new Error(error) })
        .then(() => getTree())
        .then(() => {
            const state = store.getState();
            const { tree } = state.cache;
            const promises = tree.roots.map(node => getById(node.id))
            return Promise.all(promises);
        })
        .finally(() => store.dispatch(cacheTreeActions.apply()))
}

let currentSelectedId;
let currentCacheSelectedId;

const commandsList = document.querySelectorAll('.command')

dbTree.onSelect = (id) => {
    currentSelectedId = id;
}

cacheTree.onSelect = (id) => {
    currentCacheSelectedId = id;
}
cacheTree.isEditable = true
/**
 * id would be a string as received from the attribute
 */
cacheTree.onEdit = (id, value) => {
    store.dispatch(cacheTreeActions.changeValue({ id: parseInt(id, 10), value }))
}

cacheTree.onAdd = (id, value) => {
    store.dispatch(cacheTreeActions.addValue({
        value,
        parentId: id,
        id: Math.floor(Math.random() * 1000000)
    }))
}

addToCacheButton.addEventListener('click', () => {
    if (currentSelectedId) getById(currentSelectedId);
});

const commands = {
    add: ({ id }) => {
        if (!id) {
            throw new Error('Node without Id cannot be added!');
        }
        cacheTree.showAddNewNodeTo = Number(id);
    },
    remove: ({ id }) => {
        if (!id) {
            throw new Error('Node without Id cannot be deleted!');
        }
        store.dispatch(cacheTreeActions.removeValue({ id }))
    },
    alter: ({ id }) => {
        if (!id) {
            throw new Error('Node without Id cannot be updated!');
        }
        cacheTree.editableId = Number(id);
        // store.dispatch(cacheTreeActions.changeValue({ id, value }))
    },
    apply: () => {
        const state = store.getState();
        const { transactions } = state.cache;
        applyChangesOnBackend(transactions)
    },
    reset: async () => {
        store.dispatch(cacheTreeActions.reset())
        await fetch('/api/nodes/refresh', { method: 'POST' }).catch(console.error)
        getTree();
    }
}

/** @type {EventListenerOrEventListenerObject} */
const commandProcessor = (event) => {
    const { target: { dataset: { command: commandName } = {} } = {} } = event;
    const state = store.getState();
    const { tree } = state.cache;
    const selectedNode = tree.getNode(currentCacheSelectedId);
    const { id, parentId, value } = selectedNode || {}
    const handler = commands[commandName];
    handler({ id, parentId, value });
}

commandsList.forEach(command => {
    command.addEventListener('click', commandProcessor)
})

const subscription = store.subscribe(({ cache }) => {
    cacheTree.isLoading = cache.isLoading;
    const treeValue = cache.tree.toJSON();
    cacheTree.data = treeValue;
});

