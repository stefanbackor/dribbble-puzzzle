import React, { Component, Fragment } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'react-native'
import { Asset } from 'expo-asset'
import * as Font from 'expo-font'
import { EvilIcons } from '@expo/vector-icons'
import { Provider } from 'react-redux'
import store from './src/store'
import RootNavigator from './src/navigators/Root'

import background from './assets/lightgreypolkadots.jpg'
import images from './assets/puzzles'

SplashScreen.preventAutoHideAsync().catch(() => {})

export default class App extends Component {
  state = {
    isLoadingComplete: false,
  }

  render() {
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return null
    }
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

  async componentDidMount() {
    if (this.props.skipLoadingScreen) {
      await SplashScreen.hideAsync().catch(() => {})
      return
    }
    try {
      await this._loadResourcesAsync()
      this.setState({ isLoadingComplete: true })
    } catch (e) {
      console.warn('App loading error', e)
      this.setState({ isLoadingComplete: true })
    } finally {
      await SplashScreen.hideAsync()
    }
  }

  _loadResourcesAsync = async () => {
    await Promise.all([
      Asset.loadAsync([background, ...images]),
      Font.loadAsync({
        ...EvilIcons.font,
      }),
    ])
  }
}
