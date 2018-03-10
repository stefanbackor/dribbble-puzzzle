import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import reducers from '../reducers'

const middleware = [thunk]

const enhancers = compose(applyMiddleware(...middleware))

const store = createStore(reducers, enhancers)

export default store
