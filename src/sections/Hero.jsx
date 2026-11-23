import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/gsap'
import { scrollToId } from '../hooks/useSmoothScroll'
import { MODEL_INFO } from '../data/modelInfo'
import Chars from '../ui/Chars'

/**
 * The hero is the robot's frame, not a panel. The whole left column is type
 * (oversized electric blue display line, hairline spec strip, two pill CTAs)
 * and the right half of the viewport is deliberately empty DOM so the 3D
 * machine is never covered by anything but its own shadow.
 */
const INDICATORS = [
  { k: 'ASSET', v: 'ROBOT.GLB', note: 'glTF 2.0' },
  { k: 'POLY', v: MODEL_INFO.triangles.toLocaleString(), note: 'triangles' },
  { k: 'CLIPS', v: '01', note: 'morph target' },
  { k: 'MAT', v: '05', note: 'materials' },
]

export default function Hero() {
  const rootRef = useRef(null)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    // the scroll cue belongs to the first screen only
    const cue = root.querySelector('.hero__scroll')
    const onScroll = () => {
      if (!cue) return
      const o = Math.max(0, 1 - window.scrollY / (window.innerHeight * 0.22))
      cue.style.opacity = o.toFixed(3)
      cue.style.visibility = o < 0.02 ? 'hidden' : 'visible'
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1, defaults: { ease: 'expo.out' } })
      tl.from('.hero__eyebrow', { y: 18, opacity: 0, duration: 1 })
        .from('.hero__line--sm', { y: 20, opacity: 0, duration: 1 }, 0.5)
        .from('.hero__sub', { y: 24, opacity: 0, duration: 1.05 }, 0.62)
        .from('.hero__actions > *', { y: 18, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.76)
        .from(
          '.hero__indicator',
          { y: 16, opacity: 0, duration: 0.85, stagger: 0.06, ease: 'back.out(1.6)' },
          0.9,
        )
        .from('.hero__scroll', { opacity: 0, duration: 0.9 }, 1.05)

      // the copy lifts and dissolves as the visitor scrolls into the machine;
      // scrubbed so it plays backwards on the way up
      gsap.to('.hero__content', {
        y: -48,
        opacity: 0.12,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          toggleActions: 'play none none reverse',
        },
      })
    }, root)

    return () => {
      window.removeEventListener('scroll', onScroll)
      ctx.revert()
    }
  }, [])

  return (
    <section id="section-hero" ref={rootRef} className="section hero">
      <div className="hero__content">
        <div className="hero__eyebrow">
          <span className="live-dot" />
          <span className="mono">SYSTEM INITIALIZED</span>
          <span className="hero__eyebrow-sep" />
          <span className="mono dim">LAB-ORBIT · 00</span>
        </div>

        <h1 className="hero__title" data-skew>
          <span className="hero__line-wrap">
            <Chars text="BEYOND" className="hero__line" />
          </span>
          <span className="hero__line-wrap">
            <Chars text="THE MACHINE." className="hero__line" delay={0.08} />
          </span>
        </h1>

        <span className="hero__line hero__line--sm">ENGINEERED BEYOND LIMITS.</span>

        <p className="hero__sub">
          One continuous cinematic shot through a machine. Scroll to take the camera, orbit the
          asset a full 360°, and inspect the geometry exactly as it was authored.
        </p>

        <div className="hero__actions">
          <button className="btn btn--primary" onClick={() => scrollToId('#section-explore')}>
            BEGIN EXPLORATION
            <span className="btn__arrow">→</span>
          </button>
          <button className="btn btn--ghost" onClick={() => scrollToId('#section-specs')}>
            TECHNICAL DATA
          </button>
        </div>

        <div className="hero__indicators">
          {INDICATORS.map((i) => (
            <div className="hero__indicator" key={i.k}>
              <span className="hero__indicator-k">{i.k}</span>
              <span className="hero__indicator-v">{i.v}</span>
              <span className="hero__indicator-n">{i.note}</span>
            </div>
          ))}
        </div>
      </div>

      <button className="hero__scroll" onClick={() => scrollToId('#section-intro')}>
        <span className="hero__scroll-label">SCROLL TO EXPLORE</span>
      </button>
    </section>
  )
}
