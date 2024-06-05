class Node {
    constructor(value, id, parentId, children = []) {
        this.id = id;
        this.value = value;
        this.parentId = parentId;
        this.children = children;
        this.isDeleted = false;
    }

    addChild(child) {
        child.parentId = this.id;
        this.children.push(child);
    }

    updateValue(newValue) {
        this.value = newValue;
    }

    delete() {
        this.isDeleted = true;
        this.children.forEach(child => child.delete());
    }

    toJSON() {
        return {
            id: this.id,
            value: this.value,
            parentId: this.parentId,
            isDeleted: this.isDeleted,
            children: this.children.map(child => child.toJSON())
        };
    }
}

class Tree {
    constructor() {
        this.roots = []; // Support multiple root nodes like a forest
        this.nodeMap = new Map(); // Efficient lookup for nodes
    }

    static fromObject(obj) {
        const tree = new Tree();
        if (Array.isArray(obj)) {
            obj.forEach(rootObj => {
                const rootNode = Tree.createObjectAsNode(rootObj);
                tree.roots.push(rootNode);
                tree.nodeMap.set(rootNode.id, rootNode);
            });
        }
        return tree;
    }

    static createObjectAsNode(obj, parent = null) {
        if (!obj || !obj.value || !obj.id) {
            throw new Error("Invalid node object");
        }
        const node = new Node(obj.value, obj.id, parent ? parent.id : null);
        if (obj.children) {
            obj.children.forEach(childObj => {
                const childNode = Tree.createObjectAsNode(childObj, node);
                node.addChild(childNode);
            });
        }
        return node;
    }

    attemptRebuildingTree() {
        let changesMade;
        do {
            changesMade = this.rebuildPass();
        } while (changesMade);
    }

    rebuildPass() {
        const childNodes = new Set();
        const deletedNodes = new Set();
        this.roots.forEach(node => {
            if (node.parentId && this.nodeMap.has(node.parentId)) {
                const parent = this.nodeMap.get(node.parentId);
                if (parent && !parent.isDeleted) {
                    parent.addChild(node);
                    childNodes.add(node.id);
                } else if (parent && parent.isDeleted) {
                    node.isDeleted = true;
                    node.delete();
                    deletedNodes.add(node.id);
                }
            }
        });
        this.roots = this.roots.filter(node => !childNodes.has(node.id));
        return childNodes.size > 0;
    }

    addNode(value, parentId, id) {
        const newNodeId = id || Math.floor(Math.random() * 1000000);
        if (this.nodeMap.has(newNodeId)) {
            console.error("Node with ID " + newNodeId + " already exists.");
            return null;
        }
        const parentNode = this.findNode(parentId);
        if (parentNode && !parentNode.isDeleted) {
            const newNode = new Node(value, newNodeId, parentId);
            parentNode.addChild(newNode);
            this.nodeMap.set(newNodeId, newNode);
        } else {
            console.error(`Cannot add node as child to non-existent or deleted parent with ID ${parentId}.`);
            return null;
        }
        this.attemptRebuildingTree();
    }

    findNode(id) {
        for (const root of this.roots) {
            const node = this._findNode(id, root);
            if (node) return node;
        }
        return null;
    }

    _findNode(id, node) {
        if (node.id == id) {
            return node;
        }
        for (const child of node.children) {
            const result = this._findNode(id, child);
            if (result) return result;
        }
        return null;
    }

    deleteNode(id) {
        const node = this.findNode(id);
        if (node) {
            node.delete();
        } else {
            console.error(`Tried removing node with id: ${id}, but wasn't found!`);
        }
    }

    changeValue(id, newValue) {
        const node = this.findNode(id);
        if (node) {
            node.updateValue(newValue);
        } else {
            console.error(`Tried to change value of node with id: ${id}, but wasn't found!`);
        }
    }

    toJSON() {
        return this.roots.map(root => root.toJSON());
    }
}

module.exports = { Tree }
