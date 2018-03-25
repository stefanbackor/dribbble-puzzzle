import { find, get, indexOf, shuffle, uniq } from 'lodash'
import {
  GAME_NEXT,
  GAME_COMPLETED,
  PUZZLE_ACTIVE,
  PUZZLE_NEXT,
  PUZZLE_SOLVED
} from '../constants'
import images from '../../assets/puzzles'

export function getNextLevel({ index, total }) {
  const perc = index * (total / 100)
  return perc < 20 ? 1 : perc < 30 ? 2 : perc < 80 ? 3 : perc < 90 ? 4 : 5
}

export const initialState = {
  images: shuffle(images),
  levels: [],
  active: null,
  activeLevel: 3,
  solved: [],
  finished: false
}

export default function(state = initialState, action) {
  switch (action.type) {
    case GAME_NEXT:
      return {
        ...initialState,
        images: shuffle(images)
      }
    case GAME_COMPLETED:
      return { ...state, finished: true }

    case PUZZLE_ACTIVE:
      return {
        ...state,
        active: action.image,
        activeLevel: getNextLevel({
          index: indexOf(state.images, action.image),
          total: state.images.length
        })
      }
    case PUZZLE_NEXT: {
      const firstUnsolved = find(
        state.images,
        i => indexOf(state.solved, i) < 0 && state.active !== i
      )
      const firstOnRight = get(
        state.images,
        indexOf(state.images, state.active) + 1
      )
      const image = firstOnRight || firstUnsolved
      return {
        ...state,
        active: image,
        activeLevel: getNextLevel({
          index: indexOf(state.images, image),
          total: state.images.length
        })
      }
    }
    case PUZZLE_SOLVED:
      return {
        ...state,
        solved: uniq([...state.solved, action.image || state.active])
      }

    default:
      return state
  }
}
