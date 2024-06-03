class Observer {
    constructor(value) {
        this._value = value;
        this.subscriptions = [];
    }

    subscribe(fn) {
        this.subscriptions.push(fn);
        return () => {
            const index = this.subscriptions.indexOf(fn);
            if (index > -1) {
                this.subscriptions.splice(index, 1);
            }
        }
    }

    next(value) {
        this._value = value;
        this.subscriptions.forEach(fn => {
            fn(value);
        })
    }

    get value() {
        return this._value;
    }

}

export default class Store extends Observer {
    static combineReducers(reducers) {
        const entries = Object.entries(reducers)

        return function (state, action) {
            const nextState = {}
            entries.forEach(([reducerName, reducer]) => {
                nextState[reducerName] = reducer(state?.[reducerName], action)
            })
            return nextState
        }
    }

    static INITIAL_EVENT = { type: '@@INIT' };

    constructor(reducer, initialValue) {
        super(initialValue);
        this.reducer = reducer;
        this.getState = this.getState.bind(this);
        this.dispatch(Store.INITIAL_EVENT)
    }

    getState() {
        return this._value;
    }

    dispatch(action) {
        const { reducer, getState } = this;
        const state = getState()
        const nextState = reducer(state, action);
        this.next(nextState);
    }

}