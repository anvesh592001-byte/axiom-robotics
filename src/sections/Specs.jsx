import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { MODEL_INFO as M } from '../data/modelInfo'
import { useStickyEdgeFade } from '../hooks/useStickyEdgeFade'

/**
 * Technical specification sheet.
 *
 * Layout rule: the whole readout lives in one right-hand column, and the camera
 * keeps the machine in the left half of the frame for this section — copy and
 * robot never share pixels.
 */
const ROWS = [
  ['Asset title', M.model.title],
  ['Source author', M.model.author],
  ['Licence', M.model.license],
  ['Container', M.container],
  ['Generator', M.generator],
  ['Material extension', M.extension],
  ['Binary size', `${M.fileSize} (${M.fileBytes.toLocaleString()} bytes)`],
  ['Scene nodes', String(M.nodes)],
  ['Meshes / draw calls', `${M.meshes}`],
  ['Materials', `${M.materials} — ${M.materialNames.join(' · ')}`],
  ['Vertices', M.vertices.toLocaleString()],
  ['Triangles', M.triangles.toLocaleString()],
  ['Embedded textures', `${M.textures}`],
  ['Skins / rig', `${M.skins} — static geometry`],
  ['Animation clips', `${M.animations} — “${M.animationName}”, ${M.animationDuration}`],
  ['Animated tracks', `${M.animationTracks} · morph-target influence`],
  ['Bounds (W×H×D)', `${M.boundingBox.x} × ${M.boundingBox.y} × ${M.boundingBox.z} u`],
]

const BARS = [
  { label: 'GEOMETRY BUDGET', value: M.triangles / 5000, readout: `${M.triangles.toLocaleString()} TRI` },
  { label: 'VERTEX DENSITY', value: M.vertices / 5000, readout: `${M.vertices.toLocaleString()} VERT` },
  { label: 'MATERIAL LAYERS', value: M.materials / 8, readout: `${M.materials} MAT` },
  { label: 'ANIMATION CHANNELS', value: M.animationTracks / 8, readout: `${M.animationTracks} MORPH` },
  { label: 'TEXTURE PAYLOAD', value: 0.02, readout: '0 IMG' },
]

export default function Specs() {
  const rootRef = useRef(null)

  useStickyEdgeFade(rootRef, '.specs__fade')

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.specs__row', {
        opacity: 0,
        y: 14,
        duration: 0.7,
        stagger: 0.03,
        ease: 'power2.out',
        scrollTrigger: { trigger: '#section-specs', start: 'top 55%', toggleActions: 'play none none reverse' },
      })
      gsap.from('.specs__bar', {
        scaleX: 0,
        duration: 1.3,
        stagger: 0.08,
        ease: 'expo.out',
        transformOrigin: 'left center',
        scrollTrigger: { trigger: '#section-specs', start: 'top 55%', toggleActions: 'play none none reverse' },
      })
      gsap.from('.specs__head > *', {
        y: 24,
        opacity: 0,
        duration: 1,
        stagger: 0.08,
        ease: 'expo.out',
        scrollTrigger: { trigger: '#section-specs', start: 'top 62%', toggleActions: 'play none none reverse' },
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="section-specs" ref={rootRef} className="section specs">
      <div className="specs__sticky">
        <div className="kicker kicker--abs specs__kicker">
          <span className="kicker__index">SECTION 04</span>
          <span className="kicker__line" />
          <span className="kicker__label">TECHNICAL SPECIFICATIONS</span>
        </div>

        <div className="specs__wrap">
          <div className="specs__spacer" aria-hidden="true" />

          <div className="specs__fade">
            <div className="specs__head">
              <h2 className="specs__title">
                VERIFIED
                <br />
                <span className="red">READOUT.</span>
              </h2>
              <p className="specs__lede">
                Every value below was read out of the binary at load time. If it is not in the file,
                it is not on this page.
              </p>
            </div>

            <div className="specs__bars">
              {BARS.map((b) => (
                <div className="specs__bar-row" key={b.label}>
                  <div className="specs__bar-meta">
                    <span>{b.label}</span>
                    <span>{b.readout}</span>
                  </div>
                  <div className="specs__bar-track">
                    <span
                      className="specs__bar"
                      style={{ width: `${Math.max(2, Math.min(1, b.value) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="specs__table" role="table" aria-label="Verified model specifications">
              <div className="specs__table-head" role="row">
                <span role="columnheader">PARAMETER</span>
                <span role="columnheader">VALUE</span>
              </div>
              {ROWS.map(([k, v], i) => (
                <div className="specs__row" role="row" key={k}>
                  <span className="specs__row-k" role="cell">
                    <span className="specs__row-n">{String(i + 1).padStart(2, '0')}</span>
                    {k}
                  </span>
                  <span className="specs__row-v" role="cell">
                    {v}
                  </span>
                </div>
              ))}
            </div>

            <div className="specs__note">
              <span>NOTE</span>
              <p>
                Bounds are in the asset&apos;s own unscaled units as reported by the loader.
                Exposure, bloom and lighting are presentation choices, not asset data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
