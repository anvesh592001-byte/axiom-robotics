import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * The floor — one grid, nothing else.
 *
 * A single perspective `GridHelper` fading out with distance. No second grid,
 * no cream vignette plate, no beige disc under the machine: the grid lines are
 * the only thing drawn, and where they end the page colour simply shows
 * through.
 */
export default function StudioGrid() {
  const grid = useMemo(() => {
    // ink lines instead of the old blue-grey: the grid is drawn in the same
    // black as the page's rules, so the floor reads as part of the same print
    const g = new THREE.GridHelper(24, 48, '#0b0b0f', '#0b0b0f')
    g.material.transparent = true
    g.material.opacity = 0.16
    g.material.depthWrite = false
    g.position.set(0, 0, 0)
    return g
  }, [])

  return <primitive object={grid} />
}
