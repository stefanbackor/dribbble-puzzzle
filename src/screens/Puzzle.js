import React, { Component } from 'react'
import {
  Animated,
  PanResponder,
  Image,
  Dimensions,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { sample, shuffle } from 'lodash'
import styled, { css } from 'styled-components/native'
import Piece from '../components/Piece'
import image1 from '../../assets/puzzles/superheroes.png'
import image2 from '../../assets/puzzles/rocket.png'
import image3 from '../../assets/puzzles/rocket-dribbble.png'

const PuzzleImage = styled.Image``

const Row = styled.View`
  display: flex;
  justify-content: center;
  flex-direction: row;
`

const Container = styled.View`
  border: solid 1px white;
  background-color: white;
  box-shadow: 5px 5px 5px silver;
  width: ${props => props.width};
  height: ${props => props.height};
`

const Tile = styled.View`
  position: absolute;
  left: ${props => props.left};
  top: ${props => props.top};
  opacity: 0.3;
  ${props =>
    props.success &&
    css`
      opacity: 1;
    `};
  ${props =>
    props.highlight &&
    css`
      opacity: 0.5;
    `};
`

const DraggableTile = styled(Animated.View)`
  position: absolute;
  display: ${props => (props.success ? 'none' : 'flex')};
  z-index: ${props => (props.active ? 1000 : 1)};
`

const Success = styled.Text`
  flex: 1;
  font-size: 48px;
`

export default class Puzzle extends Component {
  constructor(props) {
    super(props)
    this.image = sample([image3]) // , image2, image3
    const { width, height } = Image.resolveAssetSource(this.image)
    const ratio = width / height
    // const resultWidth = Dimensions.get('window').width - 150
    // const resultHeight = resultWidth / ratio

    const resultHeight = Dimensions.get('window').height / 2 - 100
    const resultWidth = resultHeight * ratio

    const [cols, rows] = [4, 3]

    this.state = {
      width,
      height,
      resultWidth,
      resultHeight,
      rows,
      cols,
      tileWidth: resultWidth / cols,
      tileHeight: resultHeight / rows,
      tiles: [],
      success: false
    }

    const positions = []

    // Levels of difficulty:

    // 1. show corners, main opacity to 0.3, then 0.5 on hover, then 0.5 after 3sec of dragging
    // 2. show corners, main opacity to 0.3
    // 3. no corners, main opacity to 0.3
    // 4. no corners, zero opacity, random 2 tiles placed
    // 5. no corners, zero opacity, random tile placed
    // 6. no corners, zero opacity, no tile placed

    const _ = [...Array(this.state.cols).keys()].forEach(posX =>
      [...Array(this.state.rows).keys()].forEach(posY =>
        positions.push([posX, posY])
      )
    )

    const shuffled = shuffle(positions)

    this.state.tiles = positions.map(pos => ({
      pos,
      shufflePos: shuffled.pop(),
      active: false,
      success: false,
      highlight: false,
      dropZone: {},
      pan: new Animated.ValueXY()
    }))

    this.state.tiles = this.state.tiles.map((tile, index) => ({
      ...tile,
      panResponder: PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (i => this.onPanGrant(i))(index),
        onPanResponderMove: (i => this.onPanMove(i))(index),
        onPanResponderRelease: (i => this.onPanRelease(i))(index),
        onPanResponderTerminate: (i => this.onPanRelease(i))(index)
      })
    }))
  }

  componentDidMount() {
    // this.setState({ shuffledTiles: shuffle(this.state.tiles) })
  }

  componentWillUpdate(nextProps, nextState) {}

  onSuccessPlacement = () => {
    if (this.state.tiles.filter(tile => tile.success === false).length === 0) {
      this.onSuccess()
    }
  }
  onSuccess = () => {
    this.setState({ success: true })
  }

  onPanGrant = index => () => {
    this.setTileState(index, { active: true })
  }

  onPanMove = index => (event, gesture) => {
    // if ((index => this.isDropZone(gesture, index))(index)) {
    //   this.setTileState(index, { highlight: true })
    // } else {
    //   this.setTileState(index, { highlight: false })
    // }
    return Animated.event([
      null,
      {
        dx: this.state.tiles[index].pan.x,
        dy: this.state.tiles[index].pan.y
      }
    ])(event, gesture)
  }

  onPanRelease = index => (_, gesture) => {
    if ((index => this.isDropZone(gesture, index))(index)) {
      this.setTileState(
        index,
        {
          success: true,
          highlight: false,
          active: false
        },
        () => this.onSuccessPlacement(index)
      )
    } else {
      this.setTileState(index, {
        success: false,
        highlight: false,
        active: false
      })
      Animated.spring(this.state.tiles[index].pan, {
        toValue: { x: 0, y: 0 }
      }).start()
    }
  }

  setTileState = (index, tileState, cb) =>
    this.setState(state => {
      state.tiles[index] = {
        ...state.tiles[index],
        ...tileState
      }
      return state
    }, cb)

  setDropZoneValues = (nativeEvent, index) =>
    this.setTileState(index, { dropZone: nativeEvent.layout })

  isDropZone(gesture, index) {
    const { containerLayout } = this.state
    const { moveX, moveY } = gesture
    var { x, y, width, height } = this.state.tiles[index].dropZone
    x = x + containerLayout.x
    y = y + containerLayout.y
    return moveX > x && moveX < x + width && moveY > y && moveY < y + height
  }

  tileTop = x => x * (this.state.resultHeight / this.state.rows)
  tileLeft = y => y * (this.state.resultWidth / this.state.cols)

  render() {
    const {
      cols,
      rows,
      resultWidth,
      resultHeight,
      tileWidth,
      tileHeight,
      tiles,
      success
    } = this.state

    const ImageNode = (
      <PuzzleImage
        source={this.image}
        style={{ width: resultWidth, height: resultHeight }}
      />
    )

    const pieceProps = {
      image: ImageNode,
      tileWidth,
      tileHeight,
      resultWidth,
      resultHeight
    }

    const fullProps = {
      ...pieceProps
    }

    return (
      <View style={{ position: 'relative' }}>
        <Container
          width={resultWidth + cols}
          height={resultHeight + rows}
          onLayout={({ nativeEvent }) => {
            this.setState({ containerLayout: nativeEvent.layout })
          }}
          style={{
            top: (Dimensions.get('window').height / 2 - resultHeight) / 2,
            left: (Dimensions.get('window').width - resultWidth) / 2
          }}
        >
          {tiles.map(({ pos: [x, y], success, highlight }, index) => (
            <Tile
              key={`main-${index}`}
              success={success}
              highlight={highlight}
              top={this.tileTop(y) + y}
              left={this.tileLeft(x) + x}
              onLayout={({ nativeEvent }) =>
                this.setDropZoneValues(nativeEvent, index)
              }
            >
              <Piece
                {...fullProps}
                top={this.tileTop(y)}
                left={this.tileLeft(x)}
              />
            </Tile>
          ))}
        </Container>

        <Row>
          {success && <Success>👍</Success>}
          <Container
            style={{
              width: resultWidth,
              height: resultHeight,
              position: 'relative',
              transform: [{ scale: 0.7 }],
              marginTop: 50
            }}
          >
            {tiles.map(
              (
                {
                  active,
                  pan,
                  pos: [x, y],
                  panResponder,
                  shufflePos: [sx, sy],
                  success
                },
                index
              ) => {
                const { left, top } = pan.getLayout()
                return (
                  <DraggableTile
                    key={`shuffled-${index}`}
                    success={success}
                    active={active}
                    style={{
                      top: Animated.add(top, this.tileTop(sy)),
                      left: Animated.add(left, this.tileLeft(sx))
                    }}
                    {...panResponder.panHandlers}
                  >
                    <Piece
                      {...pieceProps}
                      top={this.tileTop(y)}
                      left={this.tileLeft(x)}
                    />
                  </DraggableTile>
                )
              }
            )}
          </Container>
        </Row>
      </View>
    )
  }
}
