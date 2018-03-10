import React, { Component } from 'react'
import styled from 'styled-components/native'
import { StyleSheet } from 'react-native'

const SIZE = 50

const Wrap = styled.View`
  width: ${props => props.width};
  height: ${props => props.height};
  overflow: hidden;
`

const Placement = styled.View`
  width: ${props => props.width};
  height: ${props => props.height};
`

const Text = styled.Text`
  color: blue;
  font-size: 22px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
`

export default class Piece extends Component {
  render() {
    const {
      image,
      resultWidth,
      resultHeight,
      tileWidth,
      tileHeight,
      top,
      left
    } = this.props
    const w = tileWidth || SIZE
    const h = tileHeight || SIZE

    return (
      <Wrap width={w} height={h}>
        {/* <Text>
          {[
            posX,
            'x',
            posY,
            '- left ',
            Math.round(posX * resultWidth / 3),
            '- top ',
            Math.round(posY * resultHeight / 3)
          ]}
        </Text> */}

        {image && (
          <Placement
            width={resultWidth}
            height={resultHeight}
            style={{
              top: top !== undefined ? 0 - top : 'auto',
              left: left !== undefined ? 0 - left : 'auto'
            }}
          >
            {image}
          </Placement>
        )}
      </Wrap>
    )
  }
}
