export class ReactiveElement extends HTMLElement {
    _state; // Private state storage
    _eventHandlers = []; // Store event handlers for cleanup

    static get properties() {
        return {};
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._initProperties();
        this.render = this.render.bind(this);
    }

    _initProperties() {
        const props = this.constructor.properties;
        Object.keys(props).forEach(prop => {
            let internalValue = this.hasAttribute(prop) ? this.getAttribute(prop) : undefined;
            Object.defineProperty(this, prop, {
                get() {
                    return internalValue;
                },
                set(newValue) {
                    const oldValue = internalValue;
                    internalValue = newValue;
                    if (props[prop].reflect) {
                        this.setAttribute(prop, newValue);
                    }
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
        this.update();
    }

    disconnectedCallback() {
        this.removeEventListeners(); // Cleanup event listeners when the element is removed
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this[name] = newValue;
        }
    }

    static get observedAttributes() {
        return Object.keys(this.properties)
            .filter(key => this.properties[key].reflect);
    }

    requestUpdate(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.update();
        }
    }

    update() {
        const renderOutput = this.render();
        const { templateString, eventBindings } = this.preprocessHTML(renderOutput);
        this.shadowRoot.innerHTML = templateString;
        this.attachEventListeners(eventBindings);
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

    /** FIXME: Not implemented properly */
    preprocessHTML(html) {
        const eventBindings = [];
        const templateString = html?.replace(/@(\w+)="(\w+)"/g, (match, eventName, handlerName) => {
            const uniqueId = `data-event-${Math.random().toString(36).substring(2, 9)}`;
            eventBindings.push({ uniqueId, eventName, handlerName });
            return `${uniqueId} `;
        });
        return { templateString, eventBindings };
    }

    /** FIXME: Not implemented properly */
    attachEventListeners(eventBindings) {
        eventBindings.forEach(({ uniqueId, eventName, handlerName }) => {
            const nodes = this.shadowRoot.querySelectorAll(`[${uniqueId}]`);
            nodes.forEach(node => {
                const boundHandler = this[handlerName].bind(this);
                node.addEventListener(eventName, boundHandler);
                this._eventHandlers.push({ node, eventName, handler: boundHandler });
                node.removeAttribute(uniqueId);  // Cleanup attribute to ensure clean HTML
            });
        });
    }

    removeEventListeners() {
        this._eventHandlers.forEach(({ node, eventName, handler }) => {
            node.removeEventListener(eventName, handler);
        });
        this._eventHandlers = [];
    }
}
