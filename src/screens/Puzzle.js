import React, { Component } from 'react'
import { Image, Dimensions, View } from 'react-native'
import { Asset, Audio, ScreenOrientation } from 'expo'
import { first, sample, shuffle, tail } from 'lodash'
import styled, { css } from 'styled-components/native'
import { EvilIcons } from '@expo/vector-icons'
import Piece from '../components/Piece'
import audioFail from '../../assets/audio/keeney_digitalaudio/pepSound3.mp3'
import audioSuccess1 from '../../assets/audio/keeney_digitalaudio/phaserUp5.mp3'
import audioSuccess2 from '../../assets/audio/keeney_digitalaudio/phaserUp6.mp3'
import audioSuccess3 from '../../assets/audio/keeney_digitalaudio/phaserUp7.mp3'
import audioComplete from '../../assets/audio/1_person_cheering-Jett_Rifkin-1851518140.mp3'

import images from '../../assets/puzzles'

const RADIUS = 35

const SUCCESS_MELODY = [
  audioSuccess1,
  audioSuccess2,
  audioSuccess3,
  audioSuccess2
]

const Row = styled.View`
  flex: 1;
  display: flex;
  justify-content: space-around;
  flex-direction: ${props => (props.landscape ? 'row' : 'column')};
`

const Column = styled.View`
  flex: 1;
  flex-basis: 50%;
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

const Results = styled.View`
  display: flex;
  justify-content: center;
  align-items: center;
`

const Success = styled.Text`
  font-size: 64px;
  line-height: 64px;
  height: 74px;
  margin: 32px 0;
`

export default class Puzzle extends Component {
  constructor(props) {
    super(props)
    this.state = {
      image: null,
      previousImage: null,
      rows: 0,
      cols: 0,
      tiles: [],
      radius: RADIUS,
      completed: false,
      successMelody: SUCCESS_MELODY
    }
  }

  containerLayout = {}

  componentDidMount() {
    this.randomize()
  }

  randomize = async () => {
    await this.load({
      image: sample(images),
      size: sample([[2, 2], [3, 2], [3, 3], [4, 3]])
    })
  }

  load = async ({ image, size: [cols, rows] }) => {
    const asset = await Asset.fromModule(image)

    const state = {
      asset,
      rows,
      cols,
      tiles: []
    }

    const positions = []

    // Levels of difficulty:

    // 1. show corners, main opacity to 0.3, then 0.5 on hover, then 0.5 after 3sec of dragging
    // 2. show corners, main opacity to 0.3
    // 3. no corners, main opacity to 0.3
    // 4. no corners, zero opacity, random 2 tiles placed, surrounding with opacity
    // 5. no corners, zero opacity, random tile placed, surrounding with opacity

    const _ = [...Array(cols).keys()].forEach(posX =>
      [...Array(rows).keys()].forEach(posY => positions.push([posX, posY]))
    )

    const shuffled = shuffle(positions)

    let tiles = positions.map(([x, y]) => ({
      pos: [x, y],
      shufflePos: shuffled.pop(),
      borderStyle: {
        overflow: 'hidden',
        borderTopLeftRadius: x === 0 && y === 0 ? RADIUS : 0,
        borderTopRightRadius: x === cols - 1 && y === 0 ? RADIUS : 0,
        borderBottomLeftRadius: x === 0 && y === rows - 1 ? RADIUS : 0,
        borderBottomRightRadius: x === cols - 1 && y === rows - 1 ? RADIUS : 0
      },
      active: false,
      success: false,
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
      const sound = new Audio.Sound()
      await sound.loadAsync(clip)
      await sound.setVolumeAsync(volume || 1)
      await sound.playAsync()
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
    this.playUIAudio({ clip: audioFail, volume: 0.4 })
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
            clip: first(this.state.successMelody),
            volume: 0.4
          })
          this.setState(state => ({
            successMelody: [
              ...tail(state.successMelody),
              first(this.state.successMelody)
            ]
          }))
        }
      }
    )
  }

  onComplete = () => {
    this.setState({ completed: true })
    this.playUIAudio({ clip: audioComplete })
  }

  onRefresh = () => {
    this.setState(
      state => ({
        completed: false,
        successMelody: SUCCESS_MELODY,
        previousImage: state.image
      }),
      this.randomize
    )
  }

  onDragStart = index => {
    const { x, y } = this.containerLayout
    const { layout } = this.state.tiles[index]
    this.setTileState(index, {
      active: true,
      dropZone: {
        ...layout,
        x: layout.x + x,
        y: layout.y + y
      }
    })
  }

  onDragEnd = index => () => {
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
    const { asset, cols, rows, tiles, completed, radius } = this.state
    const { orientation } = this.props.screenProps

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
      resultWidth = resultWidth - 0.2 * resultWidth
      resultHeight = resultWidth / ratio
      draggableResultWidth = resultWidth * 0.7
      draggableResultHeight = draggableResultWidth / ratio
    } else {
      resultHeight = Dimensions.get('window').height / 2
      resultHeight = resultHeight - 0.2 * resultHeight
      resultWidth = resultHeight * ratio
      draggableResultHeight = resultHeight * 0.7
      draggableResultWidth = draggableResultHeight * ratio
    }

    const tileWidth = resultWidth / cols
    const tileHeight = resultHeight / rows
    const draggableTileWidth = draggableResultWidth / cols
    const draggableTileHeight = draggableResultHeight / rows

    return (
      <Row landscape={orientation === ScreenOrientation.Orientation.LANDSCAPE}>
        <Column>
          <Container
            radius={radius}
            width={resultWidth + 2}
            height={resultHeight + 2}
            onLayout={({ nativeEvent }) => {
              this.containerLayout = nativeEvent.layout
            }}
          >
            {tiles.map(
              (
                { pos: [x, y], active, success, borderStyle, highlight },
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
                    borderTopWidth: y == 0 ? 0 : 1
                  }}
                  image={
                    <Image
                      source={asset}
                      style={{
                        opacity: success ? 1 : active ? 0 : 0,
                        position: 'absolute',
                        top: 0 - tileHeight * y,
                        left: 0 - tileWidth * x,
                        width: resultWidth,
                        height: resultHeight
                      }}
                    />
                  }
                  ref={`tile-${index}`}
                  onLayout={({ nativeEvent }) => {
                    this.setTileLayout(nativeEvent, index)
                  }}
                />
              )
            )}
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
                          alignItems: 'center'
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
                                height: draggableResultHeight
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
                {sample(['🤪🎂👍', '🤩👏🎯', '🌈🌈🍾', '🥁🏆🏅', '🚀💎🏁'])}
              </Success>
            </Results>
          )}
          <View
            style={{
              marginTop: 30
            }}
          >
            <EvilIcons.Button
              name="play"
              size={100}
              borderRadius={50}
              backgroundColor="transparent"
              color={completed ? 'brown' : 'silver'}
              onPress={this.onRefresh}
            />
          </View>
        </Column>
      </Row>
    )
  }
}
