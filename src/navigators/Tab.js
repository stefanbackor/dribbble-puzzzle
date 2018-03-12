import React, { Component } from 'react'
import { connect } from 'react-redux'
import { TabNavigator } from 'react-navigation'
import { tabRouteChange } from '../actions/navigation'
import Puzzle from '../screens/Puzzle'
import Score from '../screens/Score'

const Navigator = TabNavigator(
  {
    PuzzleTab: {
      label: 'Puzzle',
      screen: ({ navigation, screenProps }) => (
        <Puzzle screenProps={{ ...screenProps, tabNavigator: navigation }} />
      )
    },
    ScoreTab: {
      screen: ({ navigation, screenProps }) => (
        <Score screenProps={{ ...screenProps, tabNavigator: navigation }} />
      )
    }
  },
  {
    navigationOptions: {
      tabBarVisible: false
    }
  }
)

@connect(null, { tabRouteChange })
export default class Tab extends Component {
  handleNavigationStateChange = (prevState, currentState) => {
    const prevRoute = prevState.routes[prevState.index].routeName
    const nextRoute = currentState.routes[currentState.index].routeName
    if (prevRoute !== nextRoute) {
      this.props.tabRouteChange(nextRoute)
    }
  }

  render() {
    return (
      <Navigator
        screenProps={this.props.screenProps}
        onNavigationStateChange={this.handleNavigationStateChange}
      />
    )
  }
}
