export class ReactiveElement extends HTMLElement {
    _state; // Private state storage
    _eventHandlers = []; // Store event handlers for cleanup

    static get properties() {
        return {};
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._isInitializing = true;
        this._isUpdating = false;
        this._pendingUpdate = false;
        this._initProperties();
        this.render = this.render.bind(this);
    }

    _coerceValue(propConfig, value) {
        if (!propConfig || value === undefined) return value;
        const { type } = propConfig;
        if (!type) return value;
        if (type === Boolean) {
            if (value === '' || value === true || value === 'true') return true;
            if (value === false || value === 'false' || value === null) return false;
            return Boolean(value);
        }
        if (type === Number) {
            const parsed = Number(value);
            return Number.isNaN(parsed) ? value : parsed;
        }
        if (type === Array || type === Object) {
            if (typeof value === 'string') {
                try {
                    return JSON.parse(value);
                } catch (error) {
                    console.warn('Failed to parse JSON attribute value', error);
                }
            }
        }
        return value;
    }

    _reflectAttribute(propName, propConfig, value) {
        if (!propConfig?.reflect) return;
        if (propConfig.type === Boolean) {
            if (value) {
                this.setAttribute(propName, '');
            } else {
                this.removeAttribute(propName);
            }
            return;
        }
        if (propConfig.type === Array || propConfig.type === Object) {
            this.setAttribute(propName, JSON.stringify(value ?? null));
            return;
        }
        this.setAttribute(propName, value);
    }

    _initProperties() {
        const props = this.constructor.properties;
        Object.keys(props).forEach(prop => {
            let internalValue = this.hasAttribute(prop)
                ? this._coerceValue(props[prop], this.getAttribute(prop))
                : undefined;
            Object.defineProperty(this, prop, {
                get() {
                    return internalValue;
                },
                set(newValue) {
                    const oldValue = internalValue;
                    internalValue = this._coerceValue(props[prop], newValue);
                    this._reflectAttribute(prop, props[prop], internalValue);
                    this.requestUpdate(prop, oldValue, newValue);
                }
            });
        });
    }

    set state(initialState) {
        if (!this._state) {
            this._state = this.createReactiveState(initialState);
        } else {
            for (const key in initialState) {
                this._state[key] = initialState[key];
            }
        }
    }

    get state() {
        return this._state;
    }

    connectedCallback() {
        this._isInitializing = false;
        this.update();
    }

    disconnectedCallback() {
        this.removeEventListeners(); // Cleanup event listeners when the element is removed
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            const propConfig = this.constructor.properties?.[name];
            this[name] = this._coerceValue(propConfig, newValue);
        }
    }

    static get observedAttributes() {
        return Object.keys(this.properties)
            .filter(key => this.properties[key].reflect);
    }

    requestUpdate(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            if (this._isInitializing) {
                return;
            }
            if (this._isUpdating) {
                this._pendingUpdate = true;
                return;
            }
            this.update();
        }
    }

    update() {
        if (this._isUpdating) {
            this._pendingUpdate = true;
            return;
        }
        this._isUpdating = true;
        try {
            this.removeEventListeners();
            const renderOutput = this.render();
            const { templateString, eventBindings } = this.preprocessHTML(renderOutput);
            this.shadowRoot.innerHTML = templateString;
            this.attachEventListeners(eventBindings);
        } finally {
            this._isUpdating = false;
            if (this._pendingUpdate) {
                this._pendingUpdate = false;
                queueMicrotask(() => this.update());
            }
        }
    }

    render() {
        return '';
    }

    createReactiveState(obj) {
        const component = this;
        return new Proxy(obj, {
            set(target, property, value) {
                const oldValue = target[property];
                if (oldValue !== value) {
                    target[property] = value;
                    component.update();
                }
                return true;
            }
        });
    }

    preprocessHTML(html) {
        const eventBindings = [];
        const eventAttributeRegex = /@([\w:-]+(?:\.[\w-]+)*)=(['"])(.*?)\2/g;
        const source = typeof html === 'string' ? html : '';
        const templateString = source.replace(eventAttributeRegex, (match, eventDescriptor, quote, handlerExpression) => {
            const attributeName = `data-event-${Math.random().toString(36).substring(2, 9)}`;
            eventBindings.push({
                attributeName,
                eventDescriptor,
                handlerExpression: handlerExpression.trim()
            });
            return `${attributeName}`;
        });
        return { templateString, eventBindings };
    }

    _parseHandlerExpression(expression) {
        if (!expression) return null;
        const match = expression.match(/^([$\w.]+)\s*(?:\((.*)\))?$/);
        if (!match) return null;
        const [, handlerPath, rawArgs] = match;
        const handlerName = handlerPath.startsWith('this.') ? handlerPath.slice(5) : handlerPath;
        const args = rawArgs ? this._parseArgumentList(rawArgs) : [];
        return { handlerName, args };
    }

    _parseArgumentList(rawArgs) {
        const args = [];
        let current = '';
        let inString = false;
        let stringChar = '';
        let currentIsString = false;
        let escapeNext = false;
        for (let i = 0; i < rawArgs.length; i += 1) {
            const char = rawArgs[i];
            if (escapeNext) {
                current += char;
                escapeNext = false;
                continue;
            }
            if (char === '\\') {
                escapeNext = true;
                continue;
            }
            if (inString) {
                if (char === stringChar) {
                    inString = false;
                } else {
                    current += char;
                }
                continue;
            }
            if (char === '"' || char === "'" || char === '`') {
                inString = true;
                stringChar = char;
                currentIsString = true;
                continue;
            }
            if (char === ',') {
                if (currentIsString) {
                    args.push(current);
                } else {
                    args.push(this._coerceExpressionArgument(current.trim()));
                }
                current = '';
                currentIsString = false;
                continue;
            }
            current += char;
        }
        if (currentIsString) {
            args.push(current);
        } else if (current.trim().length > 0) {
            args.push(this._coerceExpressionArgument(current.trim()));
        }
        return args;
    }

    _coerceExpressionArgument(token) {
        if (!token) return undefined;
        if (token === '$event') {
            return { __eventToken: true };
        }
        if (token === 'true') return true;
        if (token === 'false') return false;
        if (token === 'null') return null;
        if (token === 'undefined') return undefined;
        if (!Number.isNaN(Number(token))) return Number(token);
        return { __path: token };
    }

    _resolveArgument(arg, event) {
        if (arg && arg.__eventToken) return event;
        if (arg && arg.__path) {
            return arg.__path.split('.').reduce((value, key) => value?.[key], this);
        }
        return arg;
    }

    attachEventListeners(eventBindings) {
        const keyAliases = {
            enter: 'enter',
            esc: 'escape',
            escape: 'escape',
            space: ' ',
            tab: 'tab',
            up: 'arrowup',
            down: 'arrowdown',
            left: 'arrowleft',
            right: 'arrowright'
        };

        const normalizeKey = key => keyAliases[key] ?? key;
        const reservedModifiers = new Set(['capture', 'passive', 'once', 'stop', 'prevent', 'self']);

        eventBindings.forEach(({ attributeName, eventDescriptor, handlerExpression }) => {
            const [eventName, ...modifiers] = eventDescriptor.split('.');
            const handlerConfig = this._parseHandlerExpression(handlerExpression);
            const nodes = this.shadowRoot.querySelectorAll(`[${attributeName}]`);
            nodes.forEach(node => {
                if (!handlerConfig) {
                    node.removeAttribute(attributeName);
                    return;
                }
                const handler = handlerConfig.handlerName
                    .split('.')
                    .reduce((value, key) => value?.[key], this);
                if (typeof handler !== 'function') {
                    console.warn(`Handler "${handlerConfig.handlerName}" is not a function.`);
                    node.removeAttribute(attributeName);
                    return;
                }
                const options = {
                    capture: modifiers.includes('capture'),
                    passive: modifiers.includes('passive'),
                    once: modifiers.includes('once')
                };
                const keyFilters = modifiers.filter(modifier => !reservedModifiers.has(modifier));
                const listener = (event) => {
                    if (modifiers.includes('self') && event.target !== event.currentTarget) return;
                    if (modifiers.includes('stop')) event.stopPropagation();
                    if (modifiers.includes('prevent')) event.preventDefault();
                    if (keyFilters.length > 0 && event instanceof KeyboardEvent) {
                        const normalizedKey = event.key.toLowerCase();
                        const matches = keyFilters.some(filter => normalizeKey(filter) === normalizedKey);
                        if (!matches) return;
                    }
                    if (handlerConfig.args.length === 0) {
                        handler.call(this, event);
                        return;
                    }
                    const resolvedArgs = handlerConfig.args.map(arg => this._resolveArgument(arg, event));
                    handler.apply(this, resolvedArgs);
                };
                node.addEventListener(eventName, listener, options);
                this._eventHandlers.push({ node, eventName, handler: listener, options });
                node.removeAttribute(attributeName);
            });
        });
    }

    removeEventListeners() {
        this._eventHandlers.forEach(({ node, eventName, handler, options }) => {
            node.removeEventListener(eventName, handler, options);
        });
        this._eventHandlers = [];
    }
}
