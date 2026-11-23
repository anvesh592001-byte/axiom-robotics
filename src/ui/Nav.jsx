import { useEffect, useRef, useState } from 'react'
import { MODEL_INFO, NAV } from '../data/modelInfo'
import { scrollToId } from '../hooks/useSmoothScroll'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const lastRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const go = (e, href, id) => {
    e.preventDefault()
    setOpen(false)
    lastRef.current = id
    scrollToId(href)
  }

  return (
    <>
      <header className={`nav ${scrolled ? 'nav--solid' : ''}`}>
        <a
          className="nav__mark"
          href="#section-hero"
          onClick={(e) => go(e, '#section-hero', 'home')}
          aria-label="Axiom Robotics — home"
        >
          <svg viewBox="0 0 34 34" width="26" height="26" aria-hidden="true">
            <path
              d="M17 1.6 31 9.3v15.4L17 32.4 3 24.7V9.3L17 1.6Z"
              fill="none"
              stroke="#0b0b0f"
              strokeWidth="1.4"
            />
            <path d="M17 7.4 25.6 12v9.2L17 25.8 8.4 21.2V12L17 7.4Z" fill="none" stroke="rgba(11,11,15,0.35)" strokeWidth="1" />
            <circle cx="17" cy="16.6" r="2.1" fill="#1749ff" />
          </svg>
          <span className="nav__wordmark">
            AXIOM<span className="nav__wordmark-thin">ROBOTICS</span>
          </span>
        </a>

        <nav className={`nav__links ${open ? 'is-open' : ''}`} aria-label="Primary">
          {NAV.map((item, i) => (
            <a
              key={item.id}
              href={item.href}
              className="nav__link"
              onClick={(e) => go(e, item.href, item.id)}
            >
              <span className="nav__index">0{i + 1}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="nav__meta">
          <div className="status" title="Live system telemetry">
            <span className="status__dot" />
            <span className="status__label">SYSTEM ONLINE</span>
            <span className="status__sep" />
            <span className="status__unit">{MODEL_INFO.title.toUpperCase()}</span>
          </div>
          <button
            className={`nav__burger ${open ? 'is-open' : ''}`}
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span />
            <span />
          </button>
        </div>
      </header>
      {open && <div className="nav__scrim" onClick={() => setOpen(false)} />}
    </>
  )
}
