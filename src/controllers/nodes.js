const { Tree } = require('../domain/tree')
const { initialTree } = require('../domain/constants');

let tree = Tree.fromObject(initialTree);
const sleep = (ms) => {
    return new Promise(res => setTimeout(res, ms))
}

const acitions = {
    REMOVE_VALUE: (payload) => {
        const { id } = payload;
        tree.deleteNode(id)
    },
    ADD_VALUE: (payload) => {
        const { value, parentId, id } = payload;
        tree.addNode(value, parentId, id)
    },
    CHANGE_VALUE: (payload) => {
        const { id, value } = payload;
        tree.changeValue(id, value)
    },
}

const TIMEOUT = 100

async function getNodes() {
    await sleep(TIMEOUT);
    return tree.toJSON()[0];
}

async function getNode({ id }) {
    await sleep(TIMEOUT);
    const node = tree.findNode(id).toJSON();
    if (node.isDeleted) return null;
    node.children = [];
    return node;
}

async function refresh() {
    await sleep(TIMEOUT);
    tree = Tree.fromObject(initialTree);
    return tree.toJSON();
}

async function applyChanges({ changes }) {
    await sleep(TIMEOUT);
    if (Array.isArray(changes)) {
        changes.forEach(({ type, payload }) => {
            const handler = acitions[type];
            handler(payload);
        })
    }
    return true
}

module.exports = {
    getNodes,
    getNode,
    refresh,
    applyChanges,
}