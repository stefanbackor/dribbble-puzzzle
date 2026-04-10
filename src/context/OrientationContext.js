import React from 'react'
import { Orientation } from '../constants/orientation'

export const OrientationContext = React.createContext({
  orientation: Orientation.PORTRAIT,
})
