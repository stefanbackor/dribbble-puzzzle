import React from 'react'
import { connect } from 'react-redux'
import { Dimensions, Text } from 'react-native'
import styled, { css } from 'styled-components/native'
import { ScreenOrientation } from 'expo'
import { EvilIcons } from '@expo/vector-icons'
import { nextGame, finishGame, setPuzzleActive } from '../actions/game'

const Row = styled.View`
  flex: 1;
  display: flex;
  flex-direction: ${props => (props.landscape ? 'row' : 'column')};
  justify-content: center;
  align-items: center;
  padding-top: 50px;
`

const Wrap = styled.View`
  flex: 1;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  ${'' /* align-items: center; */} ${'' /* align-content: center; */};
`

const Button = styled.TouchableOpacity`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${props => props.width};
  height: ${props => props.width};
`

const Image = styled.Image`
  width: ${props => props.width};
  height: ${props => props.width};
  ${props =>
    props.solved &&
    css`
      opacity: 0;
    `};
`

@connect(
  state => ({
    images: state.game.images,
    solved: state.game.solved,
    finished: state.game.finished
  }),
  { nextGame, finishGame, setPuzzleActive }
)
export default class List extends React.Component {
  render() {
    const {
      images,
      solved,
      finished,
      screenProps: { tabNavigator, orientation }
    } = this.props
    const shortestWidth =
      Dimensions.get('window').width > Dimensions.get('window').height
        ? Dimensions.get('window').width
        : Dimensions.get('window').height
    const tileWidth = Math.floor(
      shortestWidth * 0.8 / Math.ceil(Math.sqrt(images.length))
    )
    return (
      <Row landscape={orientation === ScreenOrientation.Orientation.LANDSCAPE}>
        <Wrap>
          {images.map(image => {
            return (
              <Button
                key={image}
                activeOpacity={1}
                width={tileWidth}
                onPress={() => {
                  this.props.setPuzzleActive(image)
                  tabNavigator.navigate('PuzzleTab')
                }}
              >
                <Image
                  source={image}
                  resizeMode="cover"
                  width={tileWidth}
                  solved={solved.indexOf(image) > -1}
                />
              </Button>
            )
          })}

          <Button width={tileWidth} onPress={this.props.nextGame}>
            <EvilIcons
              name="refresh"
              size={50}
              borderRadius={50}
              backgroundColor="transparent"
              color={'silver'}
            />
          </Button>
        </Wrap>
        {/* {finished && (
          <Wrap>
            <EvilIcons.Button
              name="refresh"
              size={50}
              borderRadius={50}
              backgroundColor="transparent"
              color="silver"
              onPress={this.onRefresh}
            />
          </Wrap>
        )} */}
      </Row>
    )
  }
}
