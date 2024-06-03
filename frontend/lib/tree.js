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
        for (const child of this.children) {
            child.delete();
        }
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

export default class Tree {
    constructor() {
        this.roots = []; // Support multiple root nodes like forest
        this.nodeMap = new Map(); // Efficient lookup for nodes
    }

    static fromObject(obj) {
        const tree = new Tree();
        if (Array.isArray(obj)) {
            for (const rootObj of obj) {
                const rootNode = Tree.createObjectAsNode(rootObj);
                tree.roots.push(rootNode);
                tree.nodeMap.set(rootNode.id, rootNode);
            }
        }
        return tree;
    }

    static createObjectAsNode(obj, parentId = null) {
        if (!obj || !obj.value || !obj.id) {
            throw new Error("Invalid node object");
        }
        const node = new Node(obj.value, obj.id, parentId);
        if (obj.children) {
            for (const childObj of obj.children) {
                const childNode = Tree.createObjectAsNode(childObj, node);
                node.addChild(childNode);
            }
        }
        return node;
    }

    /**
     * If there're more then 1 root nodes
     * it's needed to check if it's possible to establish
     * new relations between nodes
     */
    attemptRebuildingTree() {
        let changesMade = true;
        while (changesMade) {
            changesMade = this.rebuildPass();
        }
    }

    rebuildPass() {
        const newRoots = [];
        const childNodes = new Set();
        this.roots.forEach(node => {
            if (node.parentId && this.nodeMap.has(node.parentId)) {
                const parent = this.nodeMap.get(node.parentId);
                if (parent && !parent.isDeleted) {
                    parent.addChild(node);
                    childNodes.add(node.id);
                }
            }
        });
        let foundNewParent = false;
        this.roots.forEach(node => {
            if (!childNodes.has(node.id)) {
                newRoots.push(node);
            } else {
                foundNewParent = true;
            }
        });
        this.roots = newRoots;
        return foundNewParent;
    }

    addNode(value, parentId, id) {
        const newNodeId = id || Math.floor(Math.random() * 1000000);
        const parentNode = this.nodeMap.get(parentId);
        if (parentNode) {
            const newNode = new Node(value, newNodeId, parentNode);
            parentNode.addChild(newNode);
            this.nodeMap.set(newNodeId, newNode);
            if (this.roots.length > 1) {
                this.attemptRebuildingTree();
            }
            return newNode;
        } else {
            const newNode = new Node(value, newNodeId, parentId);
            this.roots.push(newNode);
            this.nodeMap.set(newNodeId, newNode);

            if (this.roots.length > 1) {
                this.attemptRebuildingTree();
            }
            return newNode;
        }
    }

    getNode(id) {
        return this.nodeMap.get(id)
    }

    deleteNode(id) {
        const node = this.nodeMap.get(id);
        if (node) {
            node.delete();
            // do not delete actually, just mark as deleted
            // this.nodeMap.delete(id);
        } else {
            throw new Error('Node not found');
        }
    }

    changeValue(id, newValue) {
        const node = this.nodeMap.get(id);
        if (node) {
            node.updateValue(newValue);
        } else {
            throw new Error('Node not found');
        }
    }

    toJSON() {
        return this.roots.map(root => root.toJSON());
    }
}

