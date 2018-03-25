import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  TabNavigator,
  TabBarTop,
  TabBarBottom,
  NavigationActions
} from 'react-navigation'
import { EvilIcons } from '@expo/vector-icons'
import { tabRouteChange } from '../actions/navigation'
import List from '../screens/List'
import Puzzle from '../screens/Puzzle'
import Score from '../screens/Score'

const Navigator = TabNavigator(
  {
    ListTab: {
      navigationOptions: {
        tabBarLabel: 'List'
        //   tabBarIcon: <EvilIcons name="play" />
      },
      screen: ({ navigation, screenProps }) => (
        <List screenProps={{ ...screenProps, tabNavigator: navigation }} />
      )
    },
    PuzzleTab: {
      navigationOptions: {
        tabBarLabel: 'Puzzle'
        //   tabBarIcon: <EvilIcons name="image" />
      },
      screen: ({ navigation, screenProps }) => (
        <Puzzle screenProps={{ ...screenProps, tabNavigator: navigation }} />
      )
    }

    // ScoreTab: {
    //   screen: ({ navigation, screenProps }) => (
    //     <Score screenProps={{ ...screenProps, tabNavigator: navigation }} />
    //   )
    // }
  },
  {
    navigationOptions: {
      tabBarVisible: false,
      animationEnabled: true,
      wipeEnabled: true
      // showLabel: true
      // tabBarIcon: <EvilIcons name="play" />,
      // tabBarComponent: TabBarBottom,
      // tabBarPosition: 'bottom'
      // swipeEnabled: false,
      // animationEnabled: false,
      // backBehavior: 'none'
    }
  }
)

@connect(null, { tabRouteChange })
export default class Tab extends Component {
  componentDidMount() {
    this.navigator.dispatch(
      NavigationActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: 'PuzzleTab' })]
      })
    )

    // console.log(this.props)
    // this.props.navigation.navigate('PuzzleTab')
  }

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
        ref={ref => {
          this.navigator = ref
        }}
        screenProps={this.props.screenProps}
        onNavigationStateChange={this.handleNavigationStateChange}
      />
    )
  }
}
