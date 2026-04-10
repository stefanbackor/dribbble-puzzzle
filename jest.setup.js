jest.mock('expo-av', () => ({
  Audio: {
    Sound: jest.fn().mockImplementation(function Sound() {
      this.loadAsync = jest.fn(() => Promise.resolve())
      this.unloadAsync = jest.fn(() => Promise.resolve())
      this.setVolumeAsync = jest.fn(() => Promise.resolve())
      this.playAsync = jest.fn(() => Promise.resolve())
      this.setOnPlaybackStatusUpdate = jest.fn()
      this.stopAsync = jest.fn(() => Promise.resolve())
    }),
  },
}))
