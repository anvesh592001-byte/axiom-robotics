import { useEffect, useRef } from 'react'

/** Custom reticle cursor — hidden on touch devices via CSS media query. */
export default function Cursor() {
  const dotRef = useRef()
  const ringRef = useRef()

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const ring = { x: target.x, y: target.y }
    let raf
    let hot = false

    const onMove = (e) => {
      target.x = e.clientX
      target.y = e.clientY
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
      }
      const el = e.target
      const interactive = !!(el.closest && el.closest('a, button, [data-hotspot]'))
      if (interactive !== hot) {
        hot = interactive
        ringRef.current?.classList.toggle('is-hot', hot)
      }
    }

    const loop = () => {
      ring.x += (target.x - ring.x) * 0.16
      ring.y += (target.y - ring.y) * 0.16
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`
      }
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div className="cursor-dot" ref={dotRef} />
      <div className="cursor-ring" ref={ringRef} />
    </>
  )
}
