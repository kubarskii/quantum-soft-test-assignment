import { ReactiveElement } from '../lib/reactiveElemet.js';

class TreeView extends ReactiveElement {

    static get properties() {
        return {
            data: { type: Array, reflect: false },
            isLoading: { type: Boolean, reflect: true },
            error: { type: String, reflect: true },
            isEditable: { type: Boolean, reflect: true },
            onSelect: { type: Object, reflect: false },
            onEdit: { type: Object, reflect: false },
        };
    }

    constructor() {
        super();
        this.state = { expandedNodes: {}, selected: null };
        this.toggleNode = this.toggleNode.bind(this)
        this.handleEvent = this.handleEvent.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.renderTree = this.renderTree.bind(this)
    }

    toggleNode(nodeId) {
        const expandedNodes = { ...this.state.expandedNodes };
        if (expandedNodes[nodeId]) {
            delete expandedNodes[nodeId];
        } else {
            expandedNodes[nodeId] = true;
        }
        this.state.expandedNodes = expandedNodes;
        this.render();
    }

    renderTree(node) {
        if (!node) return ''
        const isExpanded = this.state.expandedNodes[node.id];
        const isSelected = this.state.selected === node.id;
        return `
            <li>
                <span>
                    ${node.children && node.children.length > 0
                ? `<button data-node-id="${node.id}" class="toggle-node">${isExpanded ? '-' : '+'}</button>`
                : ''}
                </span>
                <span 
                    class="node-value${isSelected ? ' selected' : ''}"
                    ${this.isEditable ? 'contenteditable' : ''}
                    data-node-id="${node.id}">
                    ${node.value}
                </span>
                ${isExpanded && node.children && node.children.length > 0
                ? `<ul>${node.children.map(child => this.renderTree(child)).join('')}</ul>`
                : ''}
            </li>
        `;
    }

    render() {
        const { isLoading, data, error } = this;
        if (isLoading) {
            return `<div>Loading...</div>`;
        }
        if (error) {
            return `<div>Error: ${error.message}</div>`;
        }
        if (Array.isArray(data)) {
            return `
            <style>
                ul { list-style-type: none; padding-left: 20px; }
                li { margin: 5px 0; }
                button { padding: 2px 5px; margin-right: 5px; cursor: pointer; }
                .node-value { cursor: pointer; }
                .node-value:hover { color: blue; }
                .node-value.selected { background-color: #d3d3d3; } /* Highlight selected node */
                .node-value[contenteditable="true"] { border: 1px solid #ccc; padding: 2px 4px; }
                .node-value[contenteditable="false"] { pointer-events: none; }
            </style>
            <ul>
                ${data.map(rootNode => this.renderTree(rootNode)).join('')}
            </ul>
        `;
        }
        return '';
    }

    connectedCallback() {
        super.connectedCallback();
        this.shadowRoot.addEventListener('click', this.handleEvent);
        this.shadowRoot.addEventListener('input', this.handleChange);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.shadowRoot.removeEventListener('click', this.handleEvent);
        this.shadowRoot.removeEventListener('input', this.handleChange);
    }

    handleChange(event) {
        const target = event.target;
        if (target.classList.contains('node-value')) {
            const nodeId = parseInt(target.dataset.nodeId, 10);
            if (typeof this.onEdit === 'function') {
                this.onEdit(nodeId, event.target.textContent);
            }
        }
    }

    handleEvent(event) {
        const target = event.target;
        if (target.classList.contains('toggle-node')) {
            const nodeId = parseInt(target.dataset.nodeId, 10);
            this.toggleNode(nodeId);
        } else if (target.classList.contains('node-value')) {
            const nodeId = parseInt(target.dataset.nodeId, 10);
            this.state.selected = nodeId; // Set the currently focused node
            if (this.onSelect) {
                this.onSelect(nodeId);
            }
            this.render();
        }
    }
}

customElements.define("tree-view", TreeView);
