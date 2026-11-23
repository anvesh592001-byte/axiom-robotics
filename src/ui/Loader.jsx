import { useEffect, useRef, useState } from 'react'
import { useStore } from '../lib/store'
import { modelStore, preloadRobot } from '../lib/modelStore'

const BOOT_LINES = [
  'LINK  // LAB-BUS 00 · HANDSHAKE',
  'AUTH  // OPERATOR CLEARANCE ACCEPTED',
  'FETCH // /robot.glb · STREAMING BINARY',
  'CHECK // GLTF HEADER · MAGIC glTF · v2',
  'PARSE // GEOMETRY · MATERIALS · MORPH TARGETS',
  'LIGHT // CINEMATIC RIG · RED KEY + RIM',
  'CALIB // CAMERA ORBIT · 360° TIMELINE',
]

/**
 * Animated boot sequence. It is driven by the real asset pipeline (byte-level
 * progress from the fetch, then parse) — the bar cannot lie, and any failure
 * replaces the sequence with the exact technical error.
 */
export default function Loader() {
  const { status, progress, received, total, error, duration, stats } = useStore(modelStore)
  const [line, setLine] = useState(0)
  const [gone, setGone] = useState(false)
  const [pct, setPct] = useState(0)
  const dismissTimer = useRef(null)

  useEffect(() => {
    preloadRobot()
  }, [])

  // staged boot log
  useEffect(() => {
    if (status === 'error') return
    const id = setInterval(() => {
      setLine((l) => (l < BOOT_LINES.length - 1 ? l + 1 : l))
    }, 240)
    return () => clearInterval(id)
  }, [status])

  // displayed percentage eases toward the real progress (never ahead of it)
  useEffect(() => {
    let raf
    const step = () => {
      setPct((v) => {
        const target = status === 'ready' ? 100 : Math.min(99, Math.round(progress * 100))
        const next = v + (target - v) * 0.18
        return target - next < 0.4 ? target : next
      })
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [progress, status])

  // leave only once the first real frame has been rendered
  useEffect(() => {
    if (status !== 'ready') return
    let cancelled = false
    const onReady = () => {
      dismissTimer.current = setTimeout(() => !cancelled && setGone(true), 780)
    }
    if (window.__axiomCanvasReady) onReady()
    window.addEventListener('axiom:canvas-ready', onReady)
    // hard stop so a slow GPU can never trap the visitor behind the overlay
    const guard = setTimeout(() => !cancelled && setGone(true), 4200)
    return () => {
      cancelled = true
      clearTimeout(dismissTimer.current)
      clearTimeout(guard)
      window.removeEventListener('axiom:canvas-ready', onReady)
    }
  }, [status])

  const kb = total ? (total / 1024).toFixed(1) : '—'

  return (
    <div className={`loader ${gone ? 'loader--gone' : ''}`} role="status" aria-live="polite">
      <div className="loader__grid" />
      <div className="loader__inner">
        <div className="loader__top">
          <span className="mono">AXIOM // R-01</span>
          <span className="mono dim">CINEMATIC ASSET PIPELINE</span>
        </div>

        {status === 'error' ? (
          <div className="loader__error">
            <div className="loader__error-code mono">LOAD FAULT · {error?.code || 'E_UNKNOWN'}</div>
            <h2>The robot asset could not be loaded.</h2>
            <p className="mono">{error?.message}</p>
            <button className="btn btn--ghost" onClick={() => window.location.reload()}>
              RETRY BOOT SEQUENCE
            </button>
          </div>
        ) : (
          <>
            <div className="loader__center">
              <div className="loader__title">
                <span className="loader__title-a">SYSTEM</span>
                <span className="loader__title-b">INITIALIZED</span>
              </div>
              <div className="loader__bar" aria-hidden="true">
                <span className="loader__bar-fill" style={{ transform: `scaleX(${pct / 100})` }} />
                <span className="loader__bar-scan" />
              </div>
              <div className="loader__numbers mono">
                <span>{String(Math.floor(pct)).padStart(3, '0')}%</span>
                <span className="dim">
                  {status === 'decoding'
                    ? 'DECODING GEOMETRY'
                    : received
                      ? `${(received / 1024).toFixed(1)} / ${kb} KB`
                      : 'ESTABLISHING LINK'}
                </span>
              </div>
            </div>

            <div className="loader__log mono">
              {BOOT_LINES.slice(0, line + 1).map((l, i) => (
                <div key={l} className={i === line ? 'is-current' : ''}>
                  <span className="dim">{String(i + 1).padStart(2, '0')}</span> {l}
                  <span className="loader__ok">{i < line ? 'OK' : '··'}</span>
                </div>
              ))}
            </div>

            <div className="loader__foot mono dim">
              <span>GLTF 2.0 · {stats?.meshes ? `${stats.meshes} MESHES` : 'BINARY ASSET'}</span>
              <span>{duration ? `BOOT ${(duration / 1000).toFixed(2)}s` : 'STANDBY'}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
