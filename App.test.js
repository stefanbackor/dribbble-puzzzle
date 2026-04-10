import React from 'react'
import renderer, { act } from 'react-test-renderer'
import App from './App'

jest.mock('./src/navigators/Root', () => {
  const React = require('react')
  const { View } = require('react-native')
  return {
    __esModule: true,
    default: () => React.createElement(View),
  }
})

it('renders without crashing', async () => {
  let tree
  await act(async () => {
    tree = renderer.create(<App skipLoadingScreen />)
  })
  expect(tree.toJSON()).toBeTruthy()
})
