import React, { Component } from 'react'
import { Dimensions } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { connect } from 'react-redux'
import List from '../screens/List'
import Puzzle from '../screens/Puzzle'
import { Orientation } from '../constants/orientation'
import { OrientationContext } from '../context/OrientationContext'
import { rootRouteChange, tabRouteChange } from '../actions/navigation'

const Tab = createBottomTabNavigator()

@connect(null, { rootRouteChange, tabRouteChange })
export default class Root extends Component {
  constructor(props) {
    super(props)
    this.state = {
      orientation: this.orientation(Dimensions.get('window')),
    }
  }

  orientation = ({ width, height }) =>
    width > height ? Orientation.LANDSCAPE : Orientation.PORTRAIT

  componentDidMount() {
    this._dimensionsSub = Dimensions.addEventListener('change', ({ window }) => {
      this.setState({ orientation: this.orientation(window) })
    })
  }

  componentWillUnmount() {
    this._dimensionsSub?.remove()
  }

  handleNavigationStateChange = state => {
    if (!state?.routes) return
    const name = state.routes[state.index]?.name
    if (name) {
      this.props.rootRouteChange('Tab')
      this.props.tabRouteChange(name)
    }
  }

  render() {
    const { orientation } = this.state
    return (
      <OrientationContext.Provider value={{ orientation }}>
        <NavigationContainer onStateChange={this.handleNavigationStateChange}>
          <Tab.Navigator
            initialRouteName="PuzzleTab"
            tabBar={() => null}
            screenOptions={{ headerShown: false }}
          >
            <Tab.Screen name="ListTab" component={List} />
            <Tab.Screen name="PuzzleTab" component={Puzzle} />
          </Tab.Navigator>
        </NavigationContainer>
      </OrientationContext.Provider>
    )
  }
}
