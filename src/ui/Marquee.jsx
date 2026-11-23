/**
 * Infinite kinetic type ribbon. Two copies of the same text are laid side by
 * side and the track is translated -50%, which loops seamlessly. Pure CSS
 * animation, no JS per frame — and `aria-hidden` so screen readers skip it.
 */
export default function Marquee({
  items = [],
  variant = 'butter',
  reverse = false,
  speed = 34,
}) {
  const text = items.length ? items : ['AXIOM', 'R-01', 'CUTE ROBOT']
  return (
    <div
      className={`marquee marquee--${variant} ${reverse ? 'marquee--reverse' : ''}`}
      aria-hidden="true"
    >
      <div className="marquee__track" style={{ animationDuration: `${speed}s` }}>
        {[0, 1].map((copy) => (
          <div className="marquee__row" key={copy} style={{ display: 'flex' }}>
            {text.map((t, i) => (
              <span className="marquee__item" key={`${copy}-${i}`}>
                {t}
                <span className="marquee__star">✳</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
