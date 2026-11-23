import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'

/**
 * Kinetic type: splits a string into per-character spans and animates them as a
 * wave. Used for the headline beats — the animation is a single GSAP timeline
 * per line, killed on unmount, and the text stays selectable and screen-reader
 * friendly via aria-label + aria-hidden spans.
 */
export default function Chars({
  text,
  className = '',
  delay = 0,
  stagger = 0.022,
  trigger = null, // null → play on mount; otherwise a ScrollTrigger selector string
  reduced = false,
}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const chars = el.querySelectorAll('.char')

    if (reduced) {
      gsap.set(chars, { yPercent: 0, opacity: 1, rotateX: 0 })
      return
    }

    const ctx = gsap.context(() => {
      gsap.set(chars, { yPercent: 118, opacity: 0, rotateX: -55 })
      const tl = gsap.to(chars, {
        yPercent: 0,
        opacity: 1,
        rotateX: 0,
        duration: 1.15,
        ease: 'expo.out',
        stagger,
        delay,
      })
      if (trigger) {
        tl.pause()
        gsap.to(chars, {
          yPercent: 0,
          opacity: 1,
          rotateX: 0,
          duration: 1.15,
          ease: 'expo.out',
          stagger,
          scrollTrigger: { trigger, start: 'top 86%', toggleActions: 'play none none reverse' },
        })
      }
    }, el)

    return () => ctx.revert()
  }, [text, delay, stagger, trigger, reduced])

  return (
    <span ref={ref} className={className} aria-label={text}>
      {text.split('').map((c, i) => (
        <span className="char" aria-hidden="true" key={`${c}-${i}`}>
          {c === ' ' ? '\u00A0' : c}
        </span>
      ))}
    </span>
  )
}
