import React from 'react'
import { connect } from 'react-redux'
import { Dimensions } from 'react-native'
import styled, { css } from 'styled-components/native'
import { EvilIcons } from '@expo/vector-icons'
import { Orientation } from '../constants/orientation'
import { OrientationContext } from '../context/OrientationContext'
import { nextGame, finishGame, setPuzzleActive } from '../actions/game'

const Row = styled.ScrollView`
  flex: 1;
  display: flex;
  flex-direction: ${props => (props.landscape ? 'row' : 'column')};
  width: ${props => props.width};
`

const Wrap = styled.View`
  padding-top: 50px;
  padding-bottom: 50px;
  flex: 1;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  width: ${props => props.width};
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
  static contextType = OrientationContext

  render() {
    const { images, solved, finished, navigation } = this.props
    const { orientation } = this.context
    const shortestWidth =
      Dimensions.get('window').width > Dimensions.get('window').height
        ? Dimensions.get('window').width
        : Dimensions.get('window').height
    const tileWidth = Math.floor(
      shortestWidth * 0.8 / Math.ceil(Math.sqrt(images.length))
    )
    const landscape = orientation === Orientation.LANDSCAPE
    return (
      <Row landscape={landscape} width={Dimensions.get('window').width}>
        <Wrap landscape={landscape} width={Dimensions.get('window').width}>
          {images.map(image => {
            return (
              <Button
                key={image}
                activeOpacity={1}
                width={tileWidth}
                onPress={() => {
                  this.props.setPuzzleActive(image)
                  navigation.navigate('PuzzleTab')
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
              size={tileWidth / 1.5}
              backgroundColor="transparent"
              color={'silver'}
            />
          </Button>
        </Wrap>
      </Row>
    )
  }
}
