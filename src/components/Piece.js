import React, { Component } from 'react'
import { Animated, PanResponder } from 'react-native'

export default class Piece extends Component {
  constructor(props) {
    super(props)
    this.state = {
      active: false,
      pan: new Animated.ValueXY()
    }
  }

  componentWillMount() {
    this.panResponder = this.props.draggable
      ? PanResponder.create({
          onStartShouldSetPanResponder: () => true,
          onPanResponderGrant: this._onPanGrant,
          onPanResponderMove: this._onPanMove,
          onPanResponderRelease: this._onPanRelease,
          onPanResponderTerminate: this._onPanRelease
        })
      : {}
  }

  _onPanGrant = () => {
    this.setState({ active: true })
    this.props.onDragStart()
  }

  _onPanMove = (event, gesture) => {
    if (this.isDropZone(gesture)) {
      this.props.onDropZoneEnter()
    } else {
      this.props.onDropZoneLeave()
    }
    return Animated.event([
      null,
      {
        dx: this.state.pan.x,
        dy: this.state.pan.y
      }
    ])(event, gesture)
  }

  _onPanRelease = (_, gesture) => {
    this.setState({ active: false })
    this.props.onDragEnd()
    if (this.isDropZone(gesture)) {
      this.props.onDropZoneHit()
    } else {
      this.props.onDropZoneMiss()
      Animated.spring(this.state.pan, {
        toValue: { x: 0, y: 0 }
      }).start()
    }
  }

  isDropZone = gesture => {
    const { moveX, moveY } = gesture
    const { x, y, width, height } = this.props.dropZone || {}
    return moveX > x && moveX < x + width && moveY > y && moveY < y + height
  }

  render() {
    const {
      image,
      draggable,
      tileWidth,
      tileHeight,
      style,
      onLayout
    } = this.props

    const { active, pan } = this.state
    const { left, top } = pan.getLayout()

    return (
      <Animated.View
        onLayout={onLayout}
        style={{
          width: tileWidth,
          height: tileHeight,
          overflow: 'hidden',
          position: 'absolute',
          zIndex: active ? 1000 : 1,
          ...style,
          top: draggable
            ? Animated.add(top, style.top || 0)
            : style.top || 'auto',
          left: draggable
            ? Animated.add(left, style.left || 0)
            : style.left || 'auto'
        }}
        {...this.panResponder.panHandlers}
      >
        {image}
      </Animated.View>
    )
  }
}
