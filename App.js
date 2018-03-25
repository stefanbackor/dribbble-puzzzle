import React, { Component, Fragment } from 'react'
import { StatusBar } from 'react-native'
import { AppLoading, Asset, Font } from 'expo'
import { EvilIcons } from '@expo/vector-icons'
import { Provider } from 'react-redux'
import store from './src/store'
import RootNavigator from './src/navigators/Root'

import background from './assets/lightgreypolkadots.jpg'
import images from './assets/puzzles'

export default class App extends Component {
  state = {
    isLoadingComplete: false
  }

  render() {
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      )
    } else {
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
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([background, ...images]),
      Font.loadAsync({
        ...EvilIcons.font
      })
    ])
  }

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn('App loading error', error)
  }

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true })
  }
}
