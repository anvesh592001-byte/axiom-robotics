/**
 * Bridge between the R3F scene (inside <Canvas>) and the DOM overlay
 * (outside it). A component inside the canvas publishes the live camera and
 * the robot group; DOM components read them in a single rAF loop and write
 * styles directly — no React state, no re-renders.
 */
export const sceneBridge = {
  camera: null,
  robot: null,
  ready: false,

  setCamera(camera) {
    this.camera = camera
  },

  setRobot(group) {
    this.robot = group
    this.ready = !!group
  },

  clear() {
    this.camera = null
    this.robot = null
    this.ready = false
  },
}
