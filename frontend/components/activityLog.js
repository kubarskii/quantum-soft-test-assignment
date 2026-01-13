import { ReactiveElement } from '../lib/reactiveElemet.js';

class ActivityLog extends ReactiveElement {
    static get properties() {
        return {
            title: { type: String, reflect: true },
            entries: { type: Array, reflect: false },
            limit: { type: Number, reflect: true }
        };
    }

    constructor() {
        super();
        this.entries = [
            { id: 1, label: 'Cache sync completed', time: '2m ago', owner: 'System' },
            { id: 2, label: 'Manual override applied', time: '10m ago', owner: 'Leah' },
            { id: 3, label: 'Node Cluster B flagged', time: '15m ago', owner: 'Monitor' },
            { id: 4, label: 'Alert dismissed', time: '20m ago', owner: 'Devon' }
        ];
        this.limit = 3;
        this.state = {
            expanded: false
        };
        this.clearEntries = this.clearEntries.bind(this);
        this.toggleExpanded = this.toggleExpanded.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
    }

    clearEntries() {
        this.entries = [];
    }

    toggleExpanded() {
        this.state.expanded = !this.state.expanded;
    }

    render() {
        const visibleEntries = this.state.expanded ? this.entries : this.entries.slice(0, this.limit);
        return `
            <style>
                :host {
                    display: block;
                    border: 1px solid #d8dbe2;
                    border-radius: 16px;
                    padding: 18px;
                    background: #ffffff;
                    font-family: 'Inter', sans-serif;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }
                .title {
                    font-size: 16px;
                    font-weight: 600;
                }
                .log {
                    display: grid;
                    gap: 10px;
                }
                .entry {
                    padding: 10px 12px;
                    border-radius: 10px;
                    border: 1px solid #e4e7ee;
                    background: #f7f8fb;
                }
                .meta {
                    font-size: 11px;
                    color: #6a7388;
                }
                .actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 12px;
                }
                button {
                    border: none;
                    border-radius: 8px;
                    padding: 6px 10px;
                    cursor: pointer;
                    background: #1b1e25;
                    color: #ffffff;
                    font-size: 12px;
                }
                button.secondary {
                    background: #f1f3f7;
                    color: #1b1e25;
                }
                .empty {
                    font-size: 12px;
                    color: #6a7388;
                }
            </style>
            <div class="header">
                <div class="title">${this.title || 'Activity Log'}</div>
                <div class="meta">${this.entries.length} entries</div>
            </div>
            <div class="log">
                ${visibleEntries.length === 0
                    ? '<div class="empty">No recent activity.</div>'
                    : visibleEntries
                        .map(
                            entry => `
                                <div class="entry">
                                    <div>${entry.label}</div>
                                    <div class="meta">${entry.time} · ${entry.owner}</div>
                                </div>
                            `
                        )
                        .join('')}
            </div>
            <div class="actions">
                <button class="secondary" @click.prevent="toggleExpanded">
                    ${this.state.expanded ? 'Show Less' : 'Show More'}
                </button>
                <button @click.stop="clearEntries">Clear</button>
            </div>
        `;
    }
}

customElements.define('activity-log', ActivityLog);
