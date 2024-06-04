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
            onAdd: { type: Object, reflect: false },
            editableId: { type: Number, reflect: false },
            showAddNewNodeTo: { type: Boolean, reflect: true },
        };
    }

    static get observedAttributes() {
        return ['data'];
    }

    cursorPosition = 0;

    constructor() {
        super();
        this.state = { expandedNodes: {}, selected: null };
        this.toggleNode = this.toggleNode.bind(this)
        this.handleEvent = this.handleEvent.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.renderTree = this.renderTree.bind(this)
        this.restoreFocus = this.restoreFocus.bind(this);
        this.restoreFocus = this.restoreFocus.bind(this);
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
        const isEditing = this.editableId === node.id && node.isDeleted === false;
        return `
            <li>
                <span>
                    ${node.children && node.children.length > 0
                ? `<button data-node-id="${node.id}" class="toggle-node">${isExpanded ? '-' : '+'}</button>`
                : ''}
                </span>
                <span 
                    class="node-value${isSelected ? ' selected' : ''}${node.isDeleted ? ' deleted' : ''}"
                    ${isSelected && isEditing ? 'contenteditable' : ''}
                    data-node-id="${node.id}">${node.value}</span>
                <span>${isSelected && isEditing ? `<button class="save-change" data-node-id="${node.id}">Save</button>` : ''}</span>
                ${isExpanded && node.children && node.children.length > 0
                ? `<ul>${node.children.map(child => this.renderTree(child)).join('')}</ul>`
                : ''}
                ${this.showAddNewNodeTo === node.id && !node.isDeleted ? `<ul>
                    <li>
                        <input class="item-value-to-add" autofocus placeholder="Add node here" />
                        <button class="close-add">ⓧ</button><button data-node-id="${node.id}" class="apply-add">✓</button>
                    </li>
                </ul>` : ''}
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
                .node-value.deleted { color: red; text-decoration: line-through; } /* Highlight selected node */
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

    update() {
        super.update()
        this.restoreFocus();
        if (this.state.selected !== this.editableId) {
            this.editableId = null;
        }
    }

    captureCursorPosition() {
        const selection = this.shadowRoot.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const elementToFocus = this.shadowRoot
                .querySelector(`[data-node-id="${this.state.selected}"][contenteditable]`);
            if (elementToFocus) {
                this.cursorPosition = range.startOffset;
            }
        }
    }

    restoreFocus() {
        if (this.state.selected) {
            const elementToFocus = this.shadowRoot
                .querySelector(`[data-node-id="${this.state.selected}"][contenteditable]`);
            if (elementToFocus) {
                elementToFocus.focus();
                const selection = this.shadowRoot.getSelection();
                const range = document.createRange();
                range.selectNodeContents(elementToFocus);
                range.setStart(elementToFocus.firstChild, this.cursorPosition);
                range.setEnd(elementToFocus.firstChild, this.cursorPosition);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    }

    connectedCallback() {
        super.connectedCallback();
        this.shadowRoot.addEventListener('keyup', this.handleChange);
        this.shadowRoot.addEventListener('click', this.handleEvent);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.shadowRoot.removeEventListener('keyup', this.handleChange);
        this.shadowRoot.removeEventListener('click', this.handleEvent);
    }

    handleChange(event) {
        event.preventDefault();
        const target = event.target;
        if (target.classList.contains('node-value')) {
            if (target.classList.contains('node-value') && target.contentEditable)
                this.captureCursorPosition();
        }
    }

    handleEvent(event) {
        event.preventDefault();
        const target = event.target;
        if (target.classList.contains('toggle-node')) {
            const nodeId = parseInt(target.dataset.nodeId, 10);
            this.toggleNode(nodeId);
        } else if (target.classList.contains('node-value')) {
            const nodeId = parseInt(target.dataset.nodeId, 10);
            this.state.selected = nodeId;
            if (this.onSelect) {
                this.onSelect(nodeId);
            }
            this.render();
        } else if (target.classList.contains('save-change')) {
            const nodeId = parseInt(target.dataset.nodeId, 10);
            const item = this.shadowRoot.querySelector('.node-value.selected[contenteditable]')
            if (item) {
                this.onEdit(nodeId, item.textContent);
                this.editableId = null;
            }
        } else if (target.classList.contains('close-add')) {
            this.showAddNewNodeTo = null;
        } else if (target.classList.contains('apply-add')) {
            const { value } = this.shadowRoot.querySelector('.item-value-to-add');
            const nodeId = parseInt(target.dataset.nodeId, 10);
            if (typeof this.onAdd === 'function') this.onAdd(nodeId, value);
            this.showAddNewNodeTo = null;
        }
    }
}

customElements.define("tree-view", TreeView);
