import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { MODEL_INFO } from '../data/modelInfo'

/**
 * Introduction. The copy is anchored to the bottom of a tall section, so as it
 * scrolls up the machine is above it — the two never overlap for the whole beat.
 */
export default function Intro() {
  const rootRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // whole headline rises as one block, then the words pop in a wave
      gsap.fromTo(
        '.intro__title',
        { y: 70, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.3,
          ease: 'expo.out',
          scrollTrigger: { trigger: rootRef.current, start: 'top 74%', toggleActions: 'play none none reverse' },
        },
      )

      gsap.utils.toArray('.intro__word').forEach((word, i) => {
        gsap.fromTo(
          word,
          { yPercent: 108, opacity: 0, rotate: 4 },
          {
            yPercent: 0,
            opacity: 1,
            rotate: 0,
            duration: 1.05,
            ease: 'expo.out',
            delay: i * 0.045,
            scrollTrigger: { trigger: rootRef.current, start: 'top 70%', toggleActions: 'play none none reverse' },
          },
        )
      })

      gsap.from('.intro__aside', {
        x: 60,
        opacity: 0,
        rotate: 2,
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 60%', toggleActions: 'play none none reverse' },
      })

      gsap.to('.intro__rule', {
        scaleX: 1,
        duration: 1.4,
        ease: 'expo.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 58%', toggleActions: 'play none none reverse' },
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="section-intro" ref={rootRef} className="section intro">
      <div className="intro__grid">
        <div className="intro__main">
          <div className="kicker">
            <span className="kicker__index">SECTION 02</span>
            <span className="kicker__line" />
            <span className="kicker__label">INTRODUCTION</span>
          </div>

          <h2 className="intro__title" data-skew>
            {['A', 'machine', 'built', 'to', 'be', 'examined,', 'not', 'just', 'rendered.'].map((w, i) => (
              <span key={i} className={`intro__word ${i > 5 ? 'intro__word--red' : ''}`}>
                {w}
              </span>
            ))}
          </h2>

          <div className="intro__rule" />

          <p className="intro__body">
            This presentation runs on the supplied asset — {MODEL_INFO.meshes} meshes,{' '}
            {MODEL_INFO.materials} materials and {MODEL_INFO.triangles.toLocaleString()} triangles,
            loaded from one {MODEL_INFO.fileSize} binary and never re-generated. The camera is not
            attached to the page; it is attached to the <em>scroll</em>, so every frame is a
            deliberate move inside the same shot.
          </p>
        </div>

        <aside className="intro__aside">
          <div className="data-card">
            <div className="data-card__head">
              <span>ASSET PROVENANCE</span>
              <span className="data-card__dot" />
            </div>
            <dl className="data-card__list">
              <div>
                <dt>Title</dt>
                <dd>{MODEL_INFO.model.title}</dd>
              </div>
              <div>
                <dt>Author</dt>
                <dd>{MODEL_INFO.model.author}</dd>
              </div>
              <div>
                <dt>Licence</dt>
                <dd>{MODEL_INFO.model.license}</dd>
              </div>
              <div>
                <dt>Generator</dt>
                <dd>{MODEL_INFO.generator}</dd>
              </div>
              <div>
                <dt>Container</dt>
                <dd>{MODEL_INFO.container}</dd>
              </div>
              <div>
                <dt>Extension</dt>
                <dd>{MODEL_INFO.extension}</dd>
              </div>
            </dl>
            <a
              className="data-card__link"
              href={MODEL_INFO.model.source}
              target="_blank"
              rel="noreferrer noopener"
            >
              VIEW ORIGINAL ASSET ↗
            </a>
          </div>

          <p className="intro__credit">
            Model “{MODEL_INFO.model.title}” by {MODEL_INFO.model.author} — licensed{' '}
            {MODEL_INFO.model.license}. Attribution shown in compliance with the licence.
          </p>
        </aside>
      </div>
    </section>
  )
}
