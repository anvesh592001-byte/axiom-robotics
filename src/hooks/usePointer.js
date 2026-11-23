import { useEffect } from 'react'
import { scrollState } from '../scene/timeline'

/**
 * Pointer feed for the camera rig. Writes into the shared mutable
 * `scrollState.pointerTarget` (raw values only); the rig does the smoothing so
 * there is exactly one damping pass and no jitter. Listener is passive and is
 * removed on unmount.
 */
export function usePointerFeed() {
  useEffect(() => {
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = (e.clientY / window.innerHeight) * 2 - 1
      scrollState.pointerTarget.x = Math.max(-1, Math.min(1, x))
      scrollState.pointerTarget.y = Math.max(-1, Math.min(1, y))
    }
    const onLeave = () => {
      scrollState.pointerTarget.x = 0
      scrollState.pointerTarget.y = 0
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave, { passive: true })
    window.addEventListener('blur', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onLeave)
    }
  }, [])
}
