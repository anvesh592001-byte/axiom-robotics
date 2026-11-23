import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { scrollState } from '../scene/timeline'

/**
 * Lenis smooth scroll, wired into the GSAP ticker and ScrollTrigger so both
 * systems share exactly one clock (two competing rAF loops is what usually
 * makes scroll-driven 3D stutter).
 */
export function useSmoothScroll(onProgress) {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const lenis = new Lenis({
      duration: reduce ? 0.01 : 1.15,
      lerp: reduce ? 1 : 0.09,
      wheelMultiplier: 1,
      touchMultiplier: 1.35,
      smoothWheel: !reduce,
      syncTouch: false,
    })

    let last = -1
    const onScroll = ({ scroll, limit }) => {
      const p = limit > 0 ? scroll / limit : 0
      const clamped = p < 0 ? 0 : p > 1 ? 1 : p
      scrollState.progress = clamped
      if (onProgress && Math.abs(clamped - last) > 0.00025) {
        last = clamped
        onProgress(clamped)
      }
    }
    const onVelocity = ({ velocity }) => {
      scrollState.velocity = velocity || 0
    }
    lenis.on('scroll', onScroll)
    lenis.on('scroll', onVelocity)
    onScroll({ scroll: lenis.scroll, limit: lenis.limit })

    const tick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    // Lenis 1.x drives the real window scroll position, so ScrollTrigger only
    // needs to be told to recalculate on each Lenis frame (no scrollerProxy —
    // a proxy on body would double-drive the scroller and break pinning).
    lenis.on('scroll', ScrollTrigger.update)
    window.__lenis = lenis
    ScrollTrigger.refresh()

    return () => {
      gsap.ticker.remove(tick)
      lenis.off('scroll', onScroll)
      lenis.off('scroll', onVelocity)
      lenis.off('scroll', ScrollTrigger.update)
      lenis.destroy()
      if (window.__lenis === lenis) delete window.__lenis
    }
  }, [onProgress])
}

/** Anchor scrolling that respects Lenis. */
export function scrollToId(id) {
  const el = document.querySelector(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY
  if (window.__lenis) {
    window.__lenis.scrollTo(top, { duration: 1.6 })
  } else {
    window.scrollTo({ top, behavior: 'smooth' })
  }
}
