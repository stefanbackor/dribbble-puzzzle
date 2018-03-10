import { ROOT_ROUTE_CHANGED, TAB_ROUTE_CHANGED } from '../constants'

export function tabRouteChange(routeName) {
  return { type: TAB_ROUTE_CHANGED, routeName }
}

export function rootRouteChange(routeName) {
  return { type: ROOT_ROUTE_CHANGED, routeName }
}
