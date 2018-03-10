import { ROOT_ROUTE_CHANGED, TAB_ROUTE_CHANGED } from '../constants'

export const initialState = {
  tabRoute: 'HomeTab',
  rootRoute: 'Tab'
}

export default function(state = initialState, action) {
  switch (action.type) {
    case ROOT_ROUTE_CHANGED:
      return {
        ...state,
        rootRoute: action.routeName
      }
    case TAB_ROUTE_CHANGED:
      return {
        ...state,
        tabRoute: action.routeName
      }
    default:
      return state
  }
}
