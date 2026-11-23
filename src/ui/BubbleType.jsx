import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'

/**
 * Display typography rendered from purpose-made 3D bubble artwork.
 *
 * The words are real images (generated glossy blue balloon letters on the same
 * yellow the page uses), so the "big typography" is an art object rather than a
 * web font. Each one is decorative — the accessible string lives in `alt` and in
 * a visually-hidden span, so nothing depends on the picture to be understood.
 *
 * `scrollStart` makes the reveal reversible: the artwork pops in as it enters
 * from below and pops back out when you scroll back up past it, so the motion
 * reverses in both directions instead of firing once.
 */
export default function BubbleType({
  src,
  alt,
  ratio = 1465 / 396,
  className = '',
  scrollStart = 'top 88%',
  delay = 0,
  intensity = 1,
}) {
  const wrapRef = useRef(null)
  const imgRef = useRef(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const img = imgRef.current
    if (!wrap || !img) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        img,
        {
          scale: 0.82 + (1 - intensity) * 0.1,
          opacity: 0,
          yPercent: 16,
          rotate: -2.2,
          filter: 'blur(10px)',
        },
        {
          scale: 1,
          opacity: 1,
          yPercent: 0,
          rotate: 0,
          filter: 'blur(0px)',
          ease: 'expo.out',
          duration: 1.15,
          delay,
          scrollTrigger: {
            trigger: wrap,
            start: scrollStart,
            // play forward on the way down, reverse on the way back up
            toggleActions: 'play none none reverse',
          },
        },
      )

      // a slow drift while it is on screen, so the art never feels pasted on
      gsap.to(img, {
        yPercent: -6 * intensity,
        ease: 'none',
        scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: 1.1 },
      })
    }, wrap)

    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [scrollStart, delay, intensity])

  return (
    <div
      ref={wrapRef}
      className={`bubble ${className}`}
      style={{ aspectRatio: String(ratio) }}
    >
      <img ref={imgRef} src={src} alt={alt} loading="lazy" decoding="async" draggable="false" />
      <span className="sr-only">{alt}</span>
    </div>
  )
}
