import { useEffect } from 'react'

/**
 * Sticky panels are 100svh tall inside taller sections, so when a section's
 * bottom edge scrolls past the viewport the panel is still half on screen and
 * bleeds into the next section. This dissolves the panel across that hand-off
 * window (one rAF loop, style writes only, no React state).
 */
export function useStickyEdgeFade(sectionRef, targetSelector, { fade = 0.42 } = {}) {
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    let raf
    const tick = () => {
      const target = section.querySelector(targetSelector)
      if (target) {
        const rect = section.getBoundingClientRect()
        const vh = window.innerHeight
        // fully visible while the section still crosses the viewport bottom,
        // dissolved by the time the section bottom reaches the top of frame
        const start = vh * 0.92
        const end = vh * (0.92 - fade)
        const o = Math.max(0, Math.min(1, (rect.bottom - end) / (start - end)))
        target.style.opacity = o.toFixed(3)
        target.style.pointerEvents = o > 0.5 ? 'auto' : 'none'
        target.style.visibility = o <= 0.002 ? 'hidden' : 'visible'
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [sectionRef, targetSelector, fade])
}
