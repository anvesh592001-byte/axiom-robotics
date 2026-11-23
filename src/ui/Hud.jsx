import { useEffect, useRef } from 'react'
import { hudOpacity, scrollState, telemetry } from '../scene/timeline'

const pad = (n, w = 2) => String(n).padStart(w, '0')

/**
 * Live technical HUD. Updated from a single rAF loop that writes textContent
 * directly — no React re-render per frame while the visitor scrolls.
 */
export default function Hud() {
  const azRef = useRef()
  const radiusRef = useRef()
  const elevRef = useRef()
  const rotRef = useRef()
  const barRef = useRef()
  const fpsRef = useRef()
  const rootRef = useRef()

  useEffect(() => {
    let raf
    let frames = 0
    let fpsAt = performance.now()
    let lastP = -1

    const tick = (now) => {
      // FPS meter
      frames += 1
      if (now - fpsAt > 500) {
        const fps = Math.round((frames * 1000) / (now - fpsAt))
        if (fpsRef.current) fpsRef.current.textContent = `${pad(fps, 3)} FPS`
        frames = 0
        fpsAt = now
      }

      const p = scrollState.progress
      if (rootRef.current) {
        const o = hudOpacity(p)
        rootRef.current.style.opacity = o.toFixed(3)
        rootRef.current.style.pointerEvents = o > 0.4 ? 'auto' : 'none'
      }
      if (Math.abs(p - lastP) > 0.0005) {
        lastP = p
        const t = telemetry(p)
        if (azRef.current) azRef.current.textContent = `${t.azimuth}°`
        if (radiusRef.current) radiusRef.current.textContent = t.radius
        if (elevRef.current) elevRef.current.textContent = `${t.elevation}°`
        if (rotRef.current) rotRef.current.textContent = `${t.rotation.toFixed(0)}°`
        if (barRef.current) barRef.current.style.transform = `scaleX(${p})`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="hud" aria-hidden="true" ref={rootRef}>
      <div className="hud__rail hud__rail--left">
        <span className="hud__k">CAM.AZ</span>
        <span className="hud__v" ref={azRef}>
          0.0°
        </span>
        <span className="hud__k">CAM.R</span>
        <span className="hud__v" ref={radiusRef}>
          4.55
        </span>
        <span className="hud__k">CAM.EL</span>
        <span className="hud__v" ref={elevRef}>
          0.0°
        </span>
        <span className="hud__k">OBJ.ROT</span>
        <span className="hud__v" ref={rotRef}>
          0°
        </span>
      </div>

      <div className="hud__rail hud__rail--right">
        <span className="hud__v" ref={fpsRef}>
          --- FPS
        </span>
        <span className="hud__k">WEBGL2 · ACES</span>
      </div>

      <div className="hud__progress">
        <div className="hud__progress-track">
          <span className="hud__progress-fill" ref={barRef} />
        </div>
        <div className="hud__progress-meta mono">
          <span>SEQUENCE 01—05</span>
          <span className="dim">SCROLL TO DIRECT</span>
        </div>
      </div>
    </div>
  )
}
