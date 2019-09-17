import React from 'react'
import { connect } from 'react-redux'
import { Image, Dimensions, View, TouchableOpacity, Text } from 'react-native'
import { ScreenOrientation } from 'expo'
import { Audio } from 'expo-av'
import { Asset } from 'expo-asset'
import { sample, sampleSize, shuffle } from 'lodash'
import styled, { css } from 'styled-components/native'
import { EvilIcons } from '@expo/vector-icons'
import { setPuzzleSolved, goToNextPuzzle } from '../actions/game'
import Piece from '../components/Piece'
import background from '../../assets/lightgreypolkadots.jpg'
import audioFail from '../../assets/audio/keeney_digitalaudio/pepSound3.mp3'
import audioSuccess from '../../assets/audio/keeney_uiaudio/switch30.mp3'
import audioComplete from '../../assets/audio/1_person_cheering-Jett_Rifkin-1851518140.mp3'

const RADIUS = 35
const ALL_OPACTITY = 0.15
const GUIDE_OPACTITY = 0.25

const Row = styled.View`
  flex: 1;
  display: flex;
  justify-content: space-around;
  flex-direction: ${props => (props.landscape ? 'row' : 'column')};

  margin-top: 50px;
  ${props =>
    props.landscape &&
    css`
      margin-top: 0;
      margin-left: 50px;
    `};

  ${props =>
    props.fullscreen &&
    css`
      justify-content: center;
      align-items: center;
      background-color: black;
    `};
`

const Column = styled.View`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Container = styled.View`
  background-color: white;
  box-shadow: 0px 0px 5px silver;
  border-radius: ${props => props.radius || 0};
  width: ${props => props.width};
  height: ${props => props.height};
  ${props =>
    props.shuffle &&
    css`
      background-color: transparent;
      box-shadow: none;
      border: 0;
    `};
`

const Background = styled.Image`
  border-radius: ${props => props.radius || 0};
  width: ${props => props.width};
  height: ${props => props.height};
  z-index: 0;
  position: absolute;
  top: 1;
  left: 1;
  right: 1;
  bottom: 1;
`

const Results = styled.View`
  display: flex;
  justify-content: center;
  align-items: center;
`

const Success = styled.Text`
  font-size: 52px;
  height: 74px;
  margin: 32px 0;
`

const Fullscreen = styled.TouchableOpacity`
  flex: 1;
  display: flex;
  justify-content: center;
`

@connect(
  state => ({ image: state.game.active, level: state.game.activeLevel }),
  {
    setPuzzleSolved,
    goToNextPuzzle
  }
)
export default class Puzzle extends React.Component {
  initialState = {
    image: null,
    previousImage: null,
    level: 0,
    previousLevel: null,
    tiles: [],
    rows: 0,
    cols: 0,

    // difficulty level related
    initial: 0,
    targetOpacity: { guide: 0, all: 0 },
    dimensions: [[2, 2], [3, 2], [3, 3], [4, 3], [4, 4]],
    radius: RADIUS,

    // Overall state
    dragging: false,
    completed: false,
    fullscreen: false
  }

  constructor(props) {
    super(props)
    this.state = {
      ...this.initialState,
      image: props.image,
      level: props.level
    }
  }

  containerLayout = {}
  audioFail = new Audio.Sound()
  audioSuccess = new Audio.Sound()
  audioComplete = new Audio.Sound()

  async componentDidMount() {
    const { image, level } = this.state
    this.randomize({ image, level })

    await this.audioFail.loadAsync(audioFail)
    await this.audioSuccess.loadAsync(audioSuccess)
    await this.audioComplete.loadAsync(audioComplete)
  }

  async componentWillUnmount() {
    await this.audioFail.unloadAsync()
    await this.audioSuccess.unloadAsync()
    await this.audioComplete.unloadAsync()
  }

  componentWillReceiveProps(nextProps) {
    const { image, level } = nextProps
    if (this.state.image !== image) {
      this.setState(this.initialState, () => this.randomize({ image, level }))
    }
  }

  getDifficultyProps = level => {
    switch (level) {
      case 5:
        return {
          dimensions: [[4, 3], [4, 4]],
          initial: 1,
          radius: 0,
          targetOpacity: { guide: 0, all: 0 }
        }
      case 4:
        return {
          dimensions: [[3, 3], [4, 3]],
          initial: 1,
          radius: 0,
          targetOpacity: { guide: 0, all: 0 }
        }
      case 3:
        return {
          dimensions: [[3, 2], [3, 3]],
          initial: 1,
          radius: 0,
          targetOpacity: { guide: ALL_OPACTITY, all: ALL_OPACTITY }
        }
      case 2:
        return {
          dimensions: [[3, 2]],
          initial: 0,
          radius: RADIUS,
          targetOpacity: { guide: GUIDE_OPACTITY, all: ALL_OPACTITY }
        }
      case 1:
        return {
          dimensions: [[2, 2]],
          initial: 0,
          radius: RADIUS,
          targetOpacity: { guide: GUIDE_OPACTITY, all: ALL_OPACTITY }
        }
      default:
        return {
          dimensions: [[3, 2], [3, 3]],
          initial: 0,
          radius: RADIUS,
          targetOpacity: { guide: ALL_OPACTITY, all: ALL_OPACTITY }
        }
    }
  }

  randomize = ({ image, level }) => {
    const difficulty = this.getDifficultyProps(level)
    this.setState(
      {
        image: image,
        level: level,
        size: sample(difficulty.dimensions) || sample(this.state.dimensions),
        ...difficulty
      },
      this.load
    )
  }

  load = async () => {
    const { image, size: [cols, rows], initial, radius } = this.state
    const asset = await Asset.fromModule(image)

    const state = {
      image,
      asset,
      rows,
      cols,
      tiles: []
    }

    const positions = []

    // Levels of difficulty:

    // 0. show corners, main opacity to 0.3, then 0.5 on hover, then 0.5 after 3sec of dragging
    // 1. show corners, main opacity to 0.3
    // 2. no corners, main opacity to 0.3
    // 3. no corners, zero opacity, random 2 tiles placed, surrounding with opacity
    // 4. no corners, zero opacity, random tile placed, surrounding with opacity

    const _ = [...Array(cols).keys()].forEach(posX =>
      [...Array(rows).keys()].forEach(posY => positions.push([posX, posY]))
    )

    const shuffled = shuffle(positions)
    const exposed = sampleSize(positions, initial)

    let tiles = positions.map(([x, y]) => ({
      pos: [x, y],
      shufflePos: shuffled.pop(),
      borderStyle: {
        overflow: 'hidden',
        borderTopLeftRadius: x === 0 && y === 0 ? radius : 0,
        borderTopRightRadius: x === cols - 1 && y === 0 ? radius : 0,
        borderBottomLeftRadius: x === 0 && y === rows - 1 ? radius : 0,
        borderBottomRightRadius: x === cols - 1 && y === rows - 1 ? radius : 0
      },
      active: false,
      success: exposed.filter(([ex, ey]) => ex === x && ey === y).length
        ? true
        : false,
      exposed: false,
      highlight: false,
      layout: {},
      dropZone: {}
    }))

    this.setState({
      ...state,
      tiles
    })
  }

  playUIAudio = async ({ clip, volume }) => {
    try {
      await clip.setVolumeAsync(volume || 1)
      await clip.playAsync()
      clip.setOnPlaybackStatusUpdate(status => {
        if (status.didJustFinish) {
          clip.stopAsync()
        }
      })
    } catch (err) {
      // 0fg
    }
  }

  onFailedPlacement = index => {
    this.setTileState(index, {
      success: false,
      highlight: false,
      active: false
    })
    this.playUIAudio({ clip: this.audioFail, volume: 0.4 })
  }

  onSuccessPlacement = index => {
    this.setTileState(
      index,
      {
        success: true,
        highlight: false,
        active: false
      },
      () => {
        if (
          this.state.tiles.filter(tile => tile.success === false).length === 0
        ) {
          this.onComplete()
        } else {
          this.playUIAudio({
            clip: this.audioSuccess,
            volume: 0.4
          })
        }
      }
    )
  }

  onComplete = () => {
    this.setState({ completed: true }, this.props.setPuzzleSolved)
    this.playUIAudio({ clip: this.audioComplete })
  }

  onRefresh = () => {
    this.setState(
      state => ({
        completed: false,
        fullscreen: false,
        previousImage: state.image,
        previousLevel: state.level
      }),
      this.props.goToNextPuzzle
    )
  }

  toggleFullscreen = () => {
    this.setState(state => ({ fullscreen: !state.fullscreen }))
  }

  onDragStart = index => {
    const { x, y } = this.containerLayout
    const { layout } = this.state.tiles[index]
    this.setState({ dragging: true })
    this.setTileState(index, {
      active: true,
      dropZone: {
        ...layout,
        x: layout.x + x,
        y: layout.y + y
      }
    })
  }

  onDragEnd = index => {
    this.setState({ dragging: false })
    this.setTileState(index, { active: false })
  }

  setTileState = (index, tileState, cb) =>
    this.setState(state => {
      state.tiles[index] = {
        ...state.tiles[index],
        ...tileState
      }
      return state
    }, cb)

  setTileLayout = ({ layout }, index) => {
    this.setTileState(index, {
      layout: layout
    })
  }

  render() {
    const {
      asset,
      cols,
      rows,
      tiles,
      completed,
      fullscreen,
      radius,
      targetOpacity
    } = this.state
    const { tabNavigator, orientation } = this.props.screenProps

    if (!asset) {
      return null
    }

    const { width, height } = asset || {}
    const ratio = width / height

    let resultWidth
    let resultHeight
    let draggableResultWidth
    let draggableResultHeight
    if (orientation === ScreenOrientation.Orientation.LANDSCAPE) {
      resultWidth = Dimensions.get('window').width / 2
      resultWidth = Math.floor(1 * resultWidth)
      resultHeight = Math.floor(resultWidth / ratio)
      draggableResultWidth = Math.floor(resultWidth * 0.6)
      draggableResultHeight = Math.floor(draggableResultWidth / ratio)
    } else {
      resultHeight = Dimensions.get('window').height / 2
      resultHeight = Math.floor(1 * resultHeight)
      resultWidth = Math.floor(resultHeight * ratio)

      draggableResultHeight = Math.floor(resultHeight * 0.6)
      draggableResultWidth = Math.floor(draggableResultHeight * ratio)
    }

    const tileWidth = Math.floor(resultWidth / cols)
    const tileHeight = Math.floor(resultHeight / rows)
    const draggableTileWidth = Math.floor(draggableResultWidth / cols)
    const draggableTileHeight = Math.floor(draggableResultHeight / rows)

    return fullscreen ? (
      <Row fullscreen>
        <Fullscreen activeOpacity={1} onPress={this.toggleFullscreen}>
          <Image
            source={asset}
            resizeMode="contain"
            style={{
              flex: 1,
              width: Dimensions.get('window').width,
              height: Dimensions.get('window').height
            }}
          />
        </Fullscreen>
      </Row>
    ) : (
      <Row landscape={orientation === ScreenOrientation.Orientation.LANDSCAPE}>
        <Column>
          <Container
            radius={radius}
            width={resultWidth}
            height={resultHeight}
            onLayout={({ nativeEvent }) => {
              this.containerLayout = nativeEvent.layout
            }}
          >
            <Background
              source={background}
              radius={radius}
              width={resultWidth}
              height={resultHeight}
            />
            <TouchableOpacity
              activeOpacity={1}
              onPress={completed ? this.toggleFullscreen : () => false}
              style={{
                position: 'relative',
                width: resultWidth,
                height: resultHeight
              }}
            >
              {tiles.map(
                (
                  {
                    pos: [x, y],
                    active,
                    exposed,
                    success,
                    borderStyle,
                    highlight
                  },
                  index
                ) => (
                  <Piece
                    key={`main-${index}-${asset.uri}`}
                    success={success}
                    highlight={highlight}
                    tileWidth={tileWidth}
                    tileHeight={tileHeight}
                    style={{
                      position: 'absolute',
                      top: tileHeight * y + 1,
                      left: tileWidth * x + 1,
                      ...borderStyle,
                      borderLeftColor: '#efefef',
                      borderLeftWidth: x == 0 ? 0 : 1,
                      borderTopColor: '#efefef',
                      borderTopWidth: y == 0 ? 0 : 1,
                      width: tileWidth,
                      height: tileHeight
                    }}
                    image={
                      <Image
                        source={asset}
                        style={{
                          opacity: success
                            ? 1
                            : exposed
                              ? GUIDE_OPACTITY
                              : active
                                ? targetOpacity.guide
                                : targetOpacity.all,
                          position: 'absolute',
                          top: 0 - tileHeight * y,
                          left: 0 - tileWidth * x,
                          width: resultWidth,
                          height: resultHeight
                        }}
                      />
                    }
                    onLayout={({ nativeEvent }) => {
                      this.setTileLayout(nativeEvent, index)
                    }}
                  />
                )
              )}
            </TouchableOpacity>
          </Container>
        </Column>

        <Column>
          {!completed && (
            <Container
              width={draggableResultWidth}
              height={draggableResultHeight}
              shuffle
            >
              {tiles.map(
                (
                  {
                    active,
                    pos: [x, y],
                    shufflePos: [sx, sy],
                    dropZone,
                    success,
                    borderStyle
                  },
                  index
                ) => {
                  return (
                    !success && (
                      <Piece
                        key={`shuffled-${index}-${asset.uri}`}
                        draggable
                        dropZone={dropZone}
                        onDragStart={() => this.onDragStart(index)}
                        onDragEnd={() => this.onDragEnd(index)}
                        onDropZoneEnter={() => false}
                        onDropZoneLeave={() => false}
                        onDropZoneHit={() => this.onSuccessPlacement(index)}
                        onDropZoneMiss={() => this.onFailedPlacement(index)}
                        tileWidth={draggableTileWidth}
                        tileHeight={draggableTileHeight}
                        style={{
                          position: 'absolute',
                          top: draggableTileHeight * sy,
                          left: draggableTileWidth * sx,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: 'transparent'
                        }}
                        image={
                          <View
                            style={{
                              flex: 1,
                              position: 'relative',
                              overflow: 'hidden',
                              width: draggableTileWidth,
                              height: draggableTileHeight,
                              transform: [{ scale: active ? 1 : 0.85 }],
                              backgroundColor: 'transparent',
                              ...borderStyle
                            }}
                          >
                            <Image
                              source={asset}
                              style={{
                                position: 'absolute',
                                top: 0 - draggableTileHeight * y,
                                left: 0 - draggableTileWidth * x,
                                width: draggableResultWidth,
                                height: draggableResultHeight,
                                backgroundColor: 'transparent'
                              }}
                            />
                          </View>
                        }
                      />
                    )
                  )
                }
              )}
            </Container>
          )}
          {completed && (
            <Results
              style={{
                width: draggableResultWidth,
                height: draggableResultHeight
              }}
            >
              <Success>
                {sample(['🤪', '🎂', '👍', '🤩', '👏', '🎯', '🌈', '🍾', '🥁', '🏆', '🏅', '🚀', '💎', '🏁'])}
                {sample(['🤪', '🎂', '👍', '🤩', '👏', '🎯', '🌈', '🍾', '🥁', '🏆', '🏅', '🚀', '💎', '🏁'])}
                {sample(['🤪', '🎂', '👍', '🤩', '👏', '🎯', '🌈', '🍾', '🥁', '🏆', '🏅', '🚀', '💎', '🏁'])}
              </Success>
            </Results>
          )}
          <View
            style={{
              marginTop: 20,
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <EvilIcons.Button
              name="navicon"
              size={50}
              borderRadius={50}
              backgroundColor="transparent"
              color={'silver'}
              onPress={() => tabNavigator.navigate('ListTab')}
            />
            <EvilIcons.Button
              name="arrow-right"
              size={completed ? 80 : 50}
              borderRadius={50}
              backgroundColor="transparent"
              color={completed ? 'gray' : 'silver'}
              onPress={this.onRefresh}
            />
          </View>
        </Column>
      </Row>
    )
  }
}
