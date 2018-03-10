import { combineReducers } from 'redux'
import navigation from './navigation'

export const rootReducer = combineReducers({
  navigation
})

export default function(state, action) {
  return rootReducer(state, action)
}
