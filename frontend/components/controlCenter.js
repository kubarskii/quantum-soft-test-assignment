import { ReactiveElement } from '../lib/reactiveElemet.js';

class ControlCenter extends ReactiveElement {
    static get properties() {
        return {
            title: { type: String, reflect: true },
            accent: { type: String, reflect: true },
            compact: { type: Boolean, reflect: true },
            context: { type: Object, reflect: false },
            filters: { type: Array, reflect: false },
            items: { type: Array, reflect: false },
            alerts: { type: Array, reflect: false }
        };
    }

    constructor() {
        super();
        this.state = {
            activeTab: 'overview',
            search: '',
            pinned: new Set(),
            status: 'Idle',
            lastAction: null
        };
        this.handleSearchInput = this.handleSearchInput.bind(this);
        this.handleSearchCommit = this.handleSearchCommit.bind(this);
        this.clearSearch = this.clearSearch.bind(this);
        this.setTab = this.setTab.bind(this);
        this.togglePin = this.togglePin.bind(this);
        this.applyFilter = this.applyFilter.bind(this);
        this.dismissAlert = this.dismissAlert.bind(this);
        this.syncStatus = this.syncStatus.bind(this);
        this.triggerQuickAction = this.triggerQuickAction.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        if (!this.context) {
            this.context = {
                environment: 'Staging',
                region: 'us-east-1',
                owner: 'Ops Team',
                lastSync: '2 min ago'
            };
        }
        if (!this.filters) {
            this.filters = [
                { id: 'healthy', label: 'Healthy', active: true },
                { id: 'warning', label: 'Warning', active: true },
                { id: 'critical', label: 'Critical', active: false }
            ];
        }
        if (!this.items) {
            this.items = [
                { id: 101, name: 'Node Cluster A', status: 'Healthy', owner: 'Leah', score: 92 },
                { id: 102, name: 'Node Cluster B', status: 'Warning', owner: 'Devon', score: 71 },
                { id: 103, name: 'Edge Cache', status: 'Healthy', owner: 'Kai', score: 88 },
                { id: 104, name: 'Search Service', status: 'Critical', owner: 'Mina', score: 45 }
            ];
        }
        if (!this.alerts) {
            this.alerts = [
                { id: 'a1', severity: 'warning', message: 'Latency spike detected in Cluster B.' },
                { id: 'a2', severity: 'critical', message: 'Search Service error budget depleted.' }
            ];
        }
    }

    setTab(tab) {
        this.state.activeTab = tab;
        this.state.lastAction = `Switched to ${tab}`;
    }

    handleSearchInput(event) {
        this.state.search = event.target.value;
    }

    handleSearchCommit() {
        this.state.status = `Filtered by "${this.state.search || 'all'}"`;
    }

    clearSearch() {
        this.state.search = '';
        this.state.status = 'Cleared search';
    }

    togglePin(itemId) {
        const pinned = new Set(this.state.pinned);
        if (pinned.has(itemId)) {
            pinned.delete(itemId);
        } else {
            pinned.add(itemId);
        }
        this.state.pinned = pinned;
        this.state.lastAction = `Pinned item ${itemId}`;
    }

    applyFilter(filterId) {
        const nextFilters = this.filters.map(filter =>
            filter.id === filterId ? { ...filter, active: !filter.active } : filter
        );
        this.filters = nextFilters;
        this.state.lastAction = `Toggled ${filterId}`;
    }

    dismissAlert(alertId) {
        this.alerts = this.alerts.filter(alert => alert.id !== alertId);
        this.state.lastAction = `Dismissed ${alertId}`;
    }

    syncStatus() {
        this.context = {
            ...this.context,
            lastSync: 'Just now'
        };
        this.state.status = 'Synced status';
    }

    triggerQuickAction(label) {
        this.state.status = `Executed ${label}`;
    }

    get filteredItems() {
        const searchTerm = this.state.search.toLowerCase();
        const activeFilters = new Set(this.filters.filter(filter => filter.active).map(filter => filter.label));
        return this.items
            .filter(item => activeFilters.has(item.status))
            .filter(item => item.name.toLowerCase().includes(searchTerm));
    }

    render() {
        const tabs = [
            { id: 'overview', label: 'Overview' },
            { id: 'signals', label: 'Signals' },
            { id: 'actions', label: 'Actions' }
        ];

        return `
            <style>
                :host {
                    display: block;
                    font-family: 'Inter', sans-serif;
                    border: 1px solid #d8dbe2;
                    border-radius: 16px;
                    padding: 20px;
                    background: #ffffff;
                    box-shadow: 0 16px 30px rgba(27, 30, 37, 0.08);
                }
                :host([compact]) {
                    padding: 12px;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }
                .title {
                    font-size: 20px;
                    font-weight: 600;
                    color: #1b1e25;
                }
                .status {
                    font-size: 12px;
                    color: #657089;
                }
                .tabs {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 16px;
                }
                .tab {
                    padding: 6px 12px;
                    border-radius: 999px;
                    border: 1px solid #e3e6ec;
                    background: #f7f8fa;
                    font-size: 13px;
                    cursor: pointer;
                }
                .tab.active {
                    background: #1b1e25;
                    color: #ffffff;
                    border-color: #1b1e25;
                }
                .grid {
                    display: grid;
                    gap: 16px;
                }
                .grid.two {
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                }
                .card {
                    padding: 12px 14px;
                    border-radius: 12px;
                    background: #f7f8fb;
                    border: 1px solid #e4e7ee;
                }
                .card h4 {
                    margin: 0 0 4px 0;
                    font-size: 14px;
                    color: #1b1e25;
                }
                .card p {
                    margin: 0;
                    font-size: 12px;
                    color: #657089;
                }
                .filters {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-top: 8px;
                }
                .chip {
                    padding: 4px 10px;
                    border-radius: 999px;
                    font-size: 12px;
                    border: 1px solid #dfe3ea;
                    background: #ffffff;
                    cursor: pointer;
                }
                .chip.active {
                    background: #0a65ff;
                    color: #ffffff;
                    border-color: #0a65ff;
                }
                .search {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }
                .search input {
                    flex: 1;
                    padding: 6px 10px;
                    border-radius: 8px;
                    border: 1px solid #d3d7df;
                    font-size: 13px;
                }
                .list {
                    display: grid;
                    gap: 10px;
                }
                .item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 12px;
                    border-radius: 10px;
                    border: 1px solid #e4e7ee;
                    background: #ffffff;
                }
                .item strong {
                    font-size: 14px;
                }
                .pill {
                    padding: 2px 8px;
                    border-radius: 999px;
                    font-size: 11px;
                    background: #eef2ff;
                    color: #1b3fb8;
                }
                .pill.warning {
                    background: #fff1d6;
                    color: #946200;
                }
                .pill.critical {
                    background: #ffe2e1;
                    color: #b42318;
                }
                .actions {
                    display: flex;
                    gap: 8px;
                }
                .btn {
                    padding: 6px 10px;
                    border-radius: 8px;
                    border: none;
                    cursor: pointer;
                    background: #1b1e25;
                    color: #ffffff;
                    font-size: 12px;
                }
                .btn.secondary {
                    background: #f1f3f7;
                    color: #1b1e25;
                }
                .alerts {
                    display: grid;
                    gap: 8px;
                }
                .alert {
                    padding: 10px 12px;
                    border-radius: 10px;
                    border: 1px solid #f0d8d9;
                    background: #fff5f6;
                    font-size: 12px;
                    display: flex;
                    justify-content: space-between;
                    gap: 8px;
                }
                .alert button {
                    border: none;
                    background: none;
                    color: #b42318;
                    cursor: pointer;
                }
                .footer {
                    margin-top: 16px;
                    font-size: 12px;
                    color: #657089;
                }
            </style>
            <div class="header">
                <div>
                    <div class="title">${this.title || 'Control Center'}</div>
                    <div class="status">${this.state.status}</div>
                </div>
                <button class="btn secondary" @click="syncStatus">Sync</button>
            </div>
            <div class="tabs">
                ${tabs
                    .map(
                        tab => `
                            <button
                                class="tab${this.state.activeTab === tab.id ? ' active' : ''}"
                                @click.prevent="setTab('${tab.id}')">
                                ${tab.label}
                            </button>
                        `
                    )
                    .join('')}
            </div>
            <div class="grid two">
                <div class="card">
                    <h4>Environment</h4>
                    <p>${this.context.environment} · ${this.context.region}</p>
                </div>
                <div class="card">
                    <h4>Owner</h4>
                    <p>${this.context.owner}</p>
                </div>
                <div class="card">
                    <h4>Last Sync</h4>
                    <p>${this.context.lastSync}</p>
                </div>
                <div class="card">
                    <h4>Last Action</h4>
                    <p>${this.state.lastAction || 'No recent actions'}</p>
                </div>
            </div>
            <div class="card" style="margin-top: 16px;">
                <h4>Search & Filters</h4>
                <div class="search">
                    <input
                        type="text"
                        placeholder="Search nodes"
                        value="${this.state.search}"
                        @input="handleSearchInput($event)"
                        @keydown.enter="handleSearchCommit">
                    <button class="btn secondary" @click="clearSearch">Clear</button>
                </div>
                <div class="filters">
                    ${this.filters
                        .map(
                            filter => `
                                <button
                                    class="chip${filter.active ? ' active' : ''}"
                                    @click="applyFilter('${filter.id}')">
                                    ${filter.label}
                                </button>
                            `
                        )
                        .join('')}
                </div>
            </div>
            <div class="card" style="margin-top: 16px;">
                <h4>Tracked Nodes</h4>
                <div class="list">
                    ${this.filteredItems
                        .map(item => {
                            const statusClass = item.status.toLowerCase();
                            const isPinned = this.state.pinned.has(item.id);
                            return `
                                <div class="item">
                                    <div>
                                        <strong>${item.name}</strong>
                                        <div class="status">Owner: ${item.owner} · Score: ${item.score}</div>
                                    </div>
                                    <div class="actions">
                                        <span class="pill ${statusClass}">${item.status}</span>
                                        <button class="btn secondary" @click="togglePin(${item.id})">
                                            ${isPinned ? 'Unpin' : 'Pin'}
                                        </button>
                                    </div>
                                </div>
                            `;
                        })
                        .join('')}
                </div>
            </div>
            <div class="card" style="margin-top: 16px;">
                <h4>Live Alerts</h4>
                <div class="alerts">
                    ${this.alerts.length === 0
                        ? '<p class="status">All clear.</p>'
                        : this.alerts
                            .map(
                                alert => `
                                    <div class="alert">
                                        <span>${alert.message}</span>
                                        <button @click.stop="dismissAlert('${alert.id}')">Dismiss</button>
                                    </div>
                                `
                            )
                            .join('')}
                </div>
            </div>
            <div class="card" style="margin-top: 16px;">
                <h4>Quick Actions</h4>
                <div class="actions">
                    <button class="btn" @click.once="triggerQuickAction('Deploy')">Deploy</button>
                    <button class="btn secondary" @click.once="triggerQuickAction('Scale')">Scale</button>
                    <button class="btn secondary" @click.once="triggerQuickAction('Restart')">Restart</button>
                </div>
            </div>
            <div class="footer">Active tab: ${this.state.activeTab}</div>
        `;
    }
}

customElements.define('control-center', ControlCenter);
