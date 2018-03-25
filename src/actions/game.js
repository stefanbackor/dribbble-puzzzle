import {
  GAME_NEXT,
  GAME_COMPLETED,
  PUZZLE_ACTIVE,
  PUZZLE_NEXT,
  PUZZLE_SOLVED
} from '../constants'

export function nextGame() {
  return { type: GAME_NEXT }
}

export function finishGame() {
  return { type: GAME_COMPLETED }
}

export function setPuzzleActive(image) {
  return { type: PUZZLE_ACTIVE, image }
}

export function setPuzzleSolved(image) {
  return { type: PUZZLE_SOLVED, image }
}

export function goToNextPuzzle() {
  return { type: PUZZLE_NEXT }
}
