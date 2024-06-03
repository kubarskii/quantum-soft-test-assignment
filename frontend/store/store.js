import Store from '../lib/store.js'
import { rootReducer } from './root.js'

export const store = new Store(rootReducer)