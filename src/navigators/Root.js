import React, { Component } from 'react'
import { StackNavigator, NavigationActions } from 'react-navigation'
import { connect } from 'react-redux'
import { rootRouteChange } from '../actions/navigation'
import Loading from '../screens/Loading'
import Puzzle from '../screens/Puzzle'

const RootNavigator = StackNavigator(
  {
    Loading: {
      screen: Loading
    },
    Puzzle: {
      screen: Puzzle
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
  componentDidMount() {
    console.log('dispatch')
    this.navigator.dispatch(
      NavigationActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: 'Puzzle' })]
      })
    )
  }

  handleNavigationStateChange = (prevState, currentState) => {
    const prevRoute = prevState.routes[prevState.index].routeName
    const nextRoute = currentState.routes[prevState.index].routeName
    if (prevRoute !== nextRoute) {
      this.props.rootRouteChange(nextRoute)
    }
  }

  render() {
    return (
      <RootNavigator
        ref={ref => {
          this.navigator = ref
        }}
        onNavigationStateChange={this.handleNavigationStateChange}
      />
    )
  }
}
