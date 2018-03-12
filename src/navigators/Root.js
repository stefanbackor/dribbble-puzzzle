import React, { Component } from 'react'
import { Dimensions } from 'react-native'
import { StackNavigator, NavigationActions } from 'react-navigation'
import { connect } from 'react-redux'
import { ScreenOrientation } from 'expo'
import { rootRouteChange } from '../actions/navigation'
import Loading from '../screens/Loading'
import Tab from './Tab'

const RootNavigator = StackNavigator(
  {
    Loading: {
      screen: Loading
    },
    Tab: {
      screen: Tab
    }
  },
  {
    mode: 'modal',
    headerMode: 'none',
    navigationOptions: {
      gesturesEnabled: false
    }
  }
)

@connect(null, { rootRouteChange })
export default class Root extends Component {
  constructor(props) {
    super(props)
    this.state = {
      orientation: this.orientation(Dimensions.get('window'))
    }
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this.handleDimensionsChange)

    this.navigator.dispatch(
      NavigationActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: 'Tab' })]
      })
    )
  }

  componentWillUnmount() {
    Dimensions.removeEventListener('change', this.handleDimensionsChange)
  }

  orientation = ({ width, height }) =>
    width > height
      ? ScreenOrientation.Orientation.LANDSCAPE
      : ScreenOrientation.Orientation.PORTRAIT

  handleDimensionsChange = ({ window }) => {
    this.setState({ orientation: this.orientation(window) })
  }

  handleNavigationStateChange = (prevState, currentState) => {
    const prevRoute = prevState.routes[prevState.index].routeName
    const nextRoute = currentState.routes[prevState.index].routeName
    if (prevRoute !== nextRoute) {
      this.props.rootRouteChange(nextRoute)
    }
  }

  render() {
    const { orientation } = this.state
    return (
      <RootNavigator
        ref={ref => {
          this.navigator = ref
        }}
        screenProps={{ orientation }}
        onNavigationStateChange={this.handleNavigationStateChange}
      />
    )
  }
}
