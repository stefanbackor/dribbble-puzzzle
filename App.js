import React, { Fragment } from 'react'
import { StatusBar } from 'react-native'
import { Provider } from 'react-redux'
import store from './src/store'
import RootNavigator from './src/navigators/Root'

export default function App() {
  return (
    <Provider store={store}>
      <Fragment>
        <StatusBar
          translucent
          barStyle="light-content"
          backgroundColor="transparent"
        />
        <RootNavigator />
      </Fragment>
    </Provider>
  )
}
