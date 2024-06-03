class Node {
    constructor(value, id, parent = null, children = []) {
        this.id = id;
        this.value = value;
        this.parent = parent;
        this.children = children;
        this.isDeleted = false;
    }

    addChild(child) {
        child.parent = this;
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
            // parentId is undefined if root
            parentId: this.parent?.id,
            value: this.value,
            isDeleted: this.isDeleted,
            children: this.children.map(child => child.toJSON())
        };
    }
}

class Tree {

    static fromObject(obj) {
        if (!obj || !obj.value || !obj.id) {
            throw new Error("Invalid node object");
        }
        const rootNode = new Node(obj.value, obj.id);
        if (obj.children) {
            for (const childObj of obj.children) {
                const childNode = Tree.createObjectAsNode(childObj, rootNode);
                rootNode.addChild(childNode);
            }
        }
        const tree = new Tree();
        tree.root = rootNode;
        return tree;
    }

    static createObjectAsNode(obj, parent = null) {
        if (!obj || !obj.value || !obj.id) {
            throw new Error("Invalid node object");
        }
        const node = new Node(obj.value, obj.id, parent);
        if (obj.children) {
            for (const childObj of obj.children) {
                const childNode = Tree.createObjectAsNode(childObj, node);
                node.addChild(childNode);
            }
        }
        return node;
    }

    constructor(rootValue, rootId) {
        this.root = new Node(rootValue, rootId);
    }

    addNode(value, parentId, id) {
        const parentNode = this.findNode(parentId, this.root);
        if (parentNode) {
            const newNodeId = id || Math.floor(Math.random() * 1000000);
            const newNode = new Node(value, newNodeId);
            parentNode.addChild(newNode);
            return newNode;
        } else {
            throw new Error('Parent node not found');
        }
    }

    findNode(id, node = this.root) {
        // strings and numbers should work
        if (node.id == id) {
            return node;
        }
        for (const child of node.children) {
            const result = this.findNode(id, child);
            if (result) {
                return result;
            }
        }
        return null;
    }

    updateNode(id, newValue) {
        const node = this.findNode(id, this.root);
        if (node) {
            node.updateValue(newValue);
        } else {
            throw new Error('Node not found');
        }
    }

    deleteNode(id) {
        const node = this.findNode(id, this.root);
        if (node) {
            node.delete();
        } else {
            throw new Error('Node not found');
        }
    }

    toJSON() {
        return this.root.toJSON();
    }
}

module.exports = { Tree }