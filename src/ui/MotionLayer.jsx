import { useEffect } from 'react'
import { scrollState } from '../scene/timeline'

/**
 * Two consent-free kinetic touches that make the page feel hand-animated:
 *
 *  1. Scroll-velocity skew — the big headline blocks lean in the direction of
 *     travel and spring back. Driven by one rAF loop that writes transforms
 *     directly (no React state, no per-element listeners).
 *  2. Magnetic buttons — the primary CTAs lean toward the pointer.
 *
 * Both are disabled under prefers-reduced-motion and are fully torn down on
 * unmount (single rAF, single delegated pointer listener).
 */
export default function MotionLayer() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const skewTargets = [...document.querySelectorAll('[data-skew]')]
    const magnets = [...document.querySelectorAll('.btn')]

    let raf
    let skew = 0
    let v = 0
    const pointer = { x: -9999, y: -9999 }
    const damped = magnets.map(() => ({ x: 0, y: 0 }))

    const onMove = (e) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
    }
    const onLeave = () => {
      pointer.x = -9999
      pointer.y = -9999
    }

    const tick = () => {
      // ── velocity skew ────────────────────────────────────────────────
      v += (scrollState.velocity - v) * 0.12
      skew += (v * 0.055 - skew) * 0.14
      const clamped = Math.max(-7, Math.min(7, skew))
      for (let i = 0; i < skewTargets.length; i++) {
        skewTargets[i].style.transform = `skewY(${clamped.toFixed(2)}deg)`
      }

      // ── magnetic CTAs ────────────────────────────────────────────────
      for (let i = 0; i < magnets.length; i++) {
        const el = magnets[i]
        const r = el.getBoundingClientRect()
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        const dx = pointer.x - cx
        const dy = pointer.y - cy
        const within = Math.abs(dx) < r.width * 0.9 && Math.abs(dy) < r.height * 1.4
        const tx = within ? Math.max(-14, Math.min(14, dx * 0.16)) : 0
        const ty = within ? Math.max(-10, Math.min(10, dy * 0.24)) : 0
        damped[i].x += (tx - damped[i].x) * 0.12
        damped[i].y += (ty - damped[i].y) * 0.12
        el.style.transform = `translate3d(${damped[i].x.toFixed(2)}px, ${damped[i].y.toFixed(
          2,
        )}px, 0)`
      }
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave, { passive: true })
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      skewTargets.forEach((el) => (el.style.transform = ''))
      magnets.forEach((el) => (el.style.transform = ''))
    }
  }, [])

  return null
}
