import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { gsap } from '../lib/gsap'
import { HOTSPOTS } from '../data/modelInfo'
import { sceneBridge } from '../scene/sceneBridge'
import { hotspotOpacity, scrollState } from '../scene/timeline'
import { useStickyEdgeFade } from '../hooks/useStickyEdgeFade'

/**
 * Component hotspots are projected from the live 3D scene: each anchor is
 * transformed by the robot's current world matrix, then projected through the
 * active camera every frame. The markers are therefore genuinely attached to
 * the geometry, and they fade out when a component rotates away from camera.
 */
function HotspotLayer({ active, onHover, onSelect }) {
  const layerRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    let raf
    const v = new THREE.Vector3()
    const anchor = new THREE.Vector3()
    const pivot = new THREE.Vector3(-0.02, 1.05, 0)
    const toCam = new THREE.Vector3()

    const tick = () => {
      const cam = sceneBridge.camera
      const robot = sceneBridge.robot
      const layer = layerRef.current
      if (layer) {
        const show = hotspotOpacity(scrollState.progress)
        layer.style.opacity = show.toFixed(3)
        layer.style.pointerEvents = show > 0.55 ? 'auto' : 'none'
      }

      if (cam && robot && layerRef.current) {
        const w = window.innerWidth
        const h = window.innerHeight
        for (let i = 0; i < HOTSPOTS.length; i++) {
          const el = markersRef.current[i]
          if (!el) continue
          anchor.fromArray(HOTSPOTS[i].anchor).applyMatrix4(robot.matrixWorld)
          v.copy(anchor).project(cam)

          const x = (v.x * 0.5 + 0.5) * w
          const y = (-v.y * 0.5 + 0.5) * h
          // facing test: is the component pointing toward the camera?
          toCam.copy(cam.position).sub(anchor).normalize()
          const outward = anchor.clone().sub(pivot).normalize()
          const facing = THREE.MathUtils.clamp(toCam.dot(outward) * 1.15 + 0.3, 0, 1)
          el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
          // flip the label inward when the marker is near the right edge so the
          // text never runs off screen
          const flip = x > w * 0.62
          if (flip !== el.__flipped) {
            el.__flipped = flip
            el.classList.toggle('is-flip', flip)
          }
          el.style.opacity = (facing * (v.z < 1 ? 1 : 0)).toFixed(3)
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="hotspots" ref={layerRef}>
      {HOTSPOTS.map((h, i) => (
        <button
          key={h.id}
          data-hotspot
          ref={(el) => (markersRef.current[i] = el)}
          className={`hotspot ${active === h.id ? 'is-active' : ''}`}
          onMouseEnter={() => onHover(h.id)}
          onMouseLeave={() => onHover(null)}
          onClick={() => onSelect(h.id)}
          aria-label={`${h.index} ${h.label}`}
        >
          <span className="hotspot__ring" />
          <span className="hotspot__dot" />
          <span className="hotspot__label">
            <span className="mono hotspot__index">{h.index}</span>
            {h.label}
          </span>
        </button>
      ))}
    </div>
  )
}

export default function Explore() {
  const rootRef = useRef(null)
  const [active, setActive] = useState('visor')
  const [hovered, setHovered] = useState(null)

  const current = HOTSPOTS.find((h) => h.id === (hovered || active)) || HOTSPOTS[0]

  useStickyEdgeFade(rootRef, '.explore__fade')

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.explore__panel', {
        y: 34,
        opacity: 0,
        duration: 1.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 45%', toggleActions: 'play none none reverse' },
      })
      gsap.from('.explore__row', {
        x: -18,
        opacity: 0,
        duration: 0.8,
        stagger: 0.06,
        ease: 'power2.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 45%', toggleActions: 'play none none reverse' },
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="section-explore" ref={rootRef} className="section explore">
      <div className="explore__sticky">
        <div className="kicker kicker--abs explore__kicker">
          <span className="kicker__index mono">SECTION 03</span>
          <span className="kicker__line" />
          <span className="kicker__label mono">ROBOT EXPLORATION</span>
        </div>

        <div className="explore__fade">
        <div className="explore__panel">
          <div className="explore__head">
            <h2 className="explore__title">
              FIVE <span className="red">COMPONENTS.</span>
              <br />
              ONE MACHINE.
            </h2>
            <p className="explore__lede">
              Markers ride the live mesh — select one to pull its real record from the asset.
            </p>
          </div>

          <ul className="explore__list">
            {HOTSPOTS.map((h) => (
              <li key={h.id}>
                <button
                  className={`explore__row ${current.id === h.id ? 'is-active' : ''}`}
                  onClick={() => setActive(h.id)}
                  onMouseEnter={() => setHovered(h.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <span className="mono explore__row-index">{h.index}</span>
                  <span className="explore__row-label">{h.label}</span>
                  <span className="mono explore__row-mesh dim">{h.mesh}</span>
                  <span className="explore__row-dot" />
                </button>
              </li>
            ))}
          </ul>

          <div className="explore__detail" key={current.id}>
            <div className="explore__detail-head">
              <span className="mono red">{current.index}</span>
              <h3>{current.title}</h3>
            </div>
            <p>{current.body}</p>
            <dl className="explore__metrics mono">
              {current.metrics.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        </div>

        <HotspotLayer active={current.id} onHover={setHovered} onSelect={setActive} />
        <div className="explore__vignette" aria-hidden="true" />
      </div>
    </section>
  )
}
