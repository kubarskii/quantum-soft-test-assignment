# Frontend UI Components

This folder contains the in-browser UI layer. The UI is built with lightweight web components based on
`ReactiveElement` and does not depend on external frameworks.

## Components

### `<control-center>`
A dashboard-like control surface that demonstrates a more advanced template syntax, including
filters, tabs, alerts, and quick actions.

**Properties**
- `title` (string): Header label.
- `context` (object): Environment metadata (region, owner, lastSync).
- `filters` (array): Status filter list.
- `items` (array): Tracked service/node list.
- `alerts` (array): Alert list.
- `compact` (boolean): Reduce padding.

### `<activity-log>`
A scrollable activity feed that supports collapsing, clearing, and entry limits.

**Properties**
- `title` (string): Header label.
- `entries` (array): List of log entries.
- `limit` (number): Number of entries to show before expanding.

## Reactive template syntax

`ReactiveElement` supports declarative event bindings inside template literals:

```
<button @click="handleClick">Click</button>
<button @click.prevent="handleClick('deploy')">Deploy</button>
<input @keydown.enter="applySearch" />
```

Supported modifiers include `stop`, `prevent`, `self`, `once`, `capture`, and `passive`. Key
modifiers (e.g. `.enter`, `.escape`) are available for keyboard events.

## Running locally

1. `npm install`
2. `npm start`
3. Visit `http://localhost:3006`
