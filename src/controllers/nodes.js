const { Tree } = require('../domain/tree')
const { initialTree } = require('../domain/constants');

let tree = Tree.fromObject(initialTree);

const sleep = (ms) => {
    return new Promise(res => setTimeout(res, ms))
}

const TIMEOUT = 1000

async function getNodes() {
    await sleep(TIMEOUT);
    return tree.toJSON();
}

async function getNode({ id }) {
    await sleep(TIMEOUT);
    const node = tree.findNode(id).toJSON()
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
    return true
}

module.exports = {
    getNodes,
    getNode,
    refresh,
    applyChanges,
}