import { combineReducers } from 'redux'
import game from './game'
import navigation from './navigation'

export const rootReducer = combineReducers({
  game,
  navigation
})

export default function(state, action) {
  return rootReducer(state, action)
}
