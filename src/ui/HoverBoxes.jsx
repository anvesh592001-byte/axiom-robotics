import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'

/**
 * Crazy hover boxes: a grid of hard-edged pastel tiles that lift, tilt in 3D
 * toward the pointer, invert to deep ink and drag a duplicate label up through
 * the tile. Each tile keeps a hairline offset shadow that snaps the other way on
 * hover, which is what gives them the "printed sticker" look.
 *
 * Everything is CSS transform + one delegated pointermove listener for the tilt;
 * no per-tile React state.
 */
export default function HoverBoxes({ items = [], columns = 4, label = 'HOVER' }) {
  const gridRef = useRef(null)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = null
    const box = { x: 0, y: 0 }
    const target = { x: 0, y: 0 }
    let active = null

    const onMove = (e) => {
      const tile = e.target.closest('.hbox')
      if (tile !== active) {
        if (active) active.style.removeProperty('--tilt')
        active = tile
      }
      if (!tile) return
      const r = tile.getBoundingClientRect()
      target.x = ((e.clientX - r.left) / r.width - 0.5) * 2
      target.y = ((e.clientY - r.top) / r.height - 0.5) * 2
    }

    const tick = () => {
      box.x += (target.x - box.x) * 0.12
      box.y += (target.y - box.y) * 0.12
      if (active) {
        active.style.setProperty(
          '--tilt',
          `perspective(620px) rotateY(${(box.x * 11).toFixed(2)}deg) rotateX(${(
            -box.y * 11
          ).toFixed(2)}deg) translateZ(14px)`,
        )
      }
      raf = requestAnimationFrame(tick)
    }
    grid.addEventListener('pointermove', onMove, { passive: true })
    raf = requestAnimationFrame(tick)

    const ctx = gsap.context(() => {
      gsap.from('.hbox', {
        y: 44,
        opacity: 0,
        rotate: -3,
        duration: 0.9,
        stagger: 0.06,
        ease: 'back.out(1.7)',
        scrollTrigger: { trigger: grid, start: 'top 88%', toggleActions: 'play none none reverse' },
      })
    }, grid)

    return () => {
      grid.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
      ctx.revert()
    }
  }, [])

  return (
    <div className="hbox-grid" ref={gridRef} style={{ '--cols': columns }}>
      {items.map((item, i) => (
        <a
          className="hbox"
          key={`${item.label}-${i}`}
          href={item.href || '#section-explore'}
          onClick={item.onClick}
        >
          <span className="hbox__index">{item.index || String(i + 1).padStart(2, '0')}</span>
          <span className="hbox__label">
            <span className="hbox__label-in">{item.label}</span>
            <span className="hbox__label-in hbox__label-in--ghost" aria-hidden="true">
              {item.label}
            </span>
          </span>
          <span className="hbox__meta">{item.meta || label}</span>
          <span className="hbox__badge" aria-hidden="true">
            ↗
          </span>
        </a>
      ))}
    </div>
  )
}
