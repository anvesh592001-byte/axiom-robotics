import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/gsap'
import { MODEL_INFO as M } from '../data/modelInfo'
import { scrollToId } from '../hooks/useSmoothScroll'
import Chars from '../ui/Chars'
import BubbleType from '../ui/BubbleType'

export default function Finale() {
  const rootRef = useRef(null)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.finale__sub, .finale__cta', {
        opacity: 0,
        y: 26,
        duration: 1,
        stagger: 0.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 62%', toggleActions: 'play none none reverse' },
      })
      gsap.from('.finale__foot-col', {
        opacity: 0,
        y: 18,
        duration: 0.8,
        stagger: 0.07,
        scrollTrigger: { trigger: '.finale__foot', start: 'top 92%', toggleActions: 'play none none reverse' },
      })
      gsap.from('.kicker--center', {
        opacity: 0,
        y: 16,
        duration: 0.9,
        scrollTrigger: { trigger: rootRef.current, start: 'top 70%', toggleActions: 'play none none reverse' },
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="section-final" ref={rootRef} className="section finale">
      <div className="finale__inner finale__inner--split">
        <div className="kicker kicker--center">
          <span className="kicker__index">SECTION 05</span>
          <span className="kicker__line" />
          <span className="kicker__label">FINAL EXPERIENCE</span>
        </div>

        <h2 className="finale__title" data-skew>
          <span className="finale__line-wrap">
            <Chars text="THREE HUNDRED" className="finale__line" trigger="#section-final" />
          </span>
          <span className="finale__line-wrap">
            <Chars text="AND SIXTY" className="finale__line red" trigger="#section-final" delay={0.1} />
          </span>
        </h2>

        <p className="finale__sub">
          You are back at the front. The same asset, the same geometry, the same clip — now fully
          circumnavigated. Nothing was substituted along the way.
        </p>

        <div className="finale__cta">
          <button className="btn btn--primary" onClick={() => scrollToId('#section-hero')}>
            RESTART THE SEQUENCE
            <span className="btn__arrow">↺</span>
          </button>
          <a className="btn btn--ghost" href={M.model.source} target="_blank" rel="noreferrer noopener">
            ORIGINAL ASSET ↗
          </a>
        </div>

        {/* the count resolves as bubble artwork instead of plain type */}
        <BubbleType
          src="/type-360.png?v=3"
          alt="Three hundred and sixty degrees"
          ratio={958 / 456}
          className="finale__bubble"
          scrollStart="top 92%"
        />

        <footer className="finale__foot">
          <div className="finale__foot-col">
            <span className="mono dim">MODEL</span>
            <span>
              “{M.model.title}” by{' '}
              <a href={M.model.authorUrl} target="_blank" rel="noreferrer noopener">
                {M.model.author}
              </a>
            </span>
          </div>
          <div className="finale__foot-col">
            <span className="mono dim">LICENCE</span>
            <a href={M.model.licenseUrl} target="_blank" rel="noreferrer noopener">
              {M.model.license}
            </a>
          </div>
          <div className="finale__foot-col">
            <span className="mono dim">BUILD</span>
            <span>React · Three.js · R3F · GSAP · Lenis</span>
          </div>
          <div className="finale__foot-col">
            <span className="mono dim">AXIOM ROBOTICS</span>
            <span>© 2026 — ALL SYSTEMS NOMINAL</span>
          </div>
        </footer>
      </div>
    </section>
  )
}
