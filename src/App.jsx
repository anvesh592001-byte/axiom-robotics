import { useCallback } from 'react'
import Scene from './scene/Scene'
import Nav from './ui/Nav'
import Loader from './ui/Loader'
import Hud from './ui/Hud'
import Cursor from './ui/Cursor'
import MotionLayer from './ui/MotionLayer'
import Marquee from './ui/Marquee'
import BubbleType from './ui/BubbleType'
import HoverBoxes from './ui/HoverBoxes'
import Hero from './sections/Hero'
import Intro from './sections/Intro'
import Explore from './sections/Explore'
import Specs from './sections/Specs'
import Finale from './sections/Finale'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { usePointerFeed } from './hooks/usePointer'
import { MODEL_INFO as M } from './data/modelInfo'

export default function App() {
  // The single scroll channel: Lenis → scene timeline. Kept free of React
  // state by design (see scene/timeline.js).
  const onProgress = useCallback((p) => {
    window.__axiomProgress = p
  }, [])

  useSmoothScroll(onProgress)
  usePointerFeed()

  return (
    <div className="app">
      {/* two barely-there deeper-yellow washes behind the (transparent) canvas */}
      <div className="blobs" aria-hidden="true">
        <span className="blob blob--1" />
        <span className="blob blob--2" />
      </div>

      <Scene />
      <div className="grain" aria-hidden="true" />

      <Loader />
      <Nav />
      <Cursor />
      <MotionLayer />
      <Hud />

      <main className="content">
        <Hero />

        <Marquee
          variant="sky"
          speed={38}
          items={[
            'NEXT GENERATION ROBOTICS',
            `${M.triangles.toLocaleString()} TRIANGLES`,
            'GLTF 2.0',
            'ENGINEERED BEYOND LIMITS',
            `${M.meshes} MESHES`,
          ]}
        />

        <Intro />

        <Marquee
          variant="violet"
          reverse
          speed={30}
          items={['SCROLL IS THE CUT', 'ONE CONTINUOUS SHOT', '360° IN ONE GESTURE', 'AXIOM LAB']}
        />

        <Explore />

        <Marquee
          variant="butter"
          speed={42}
          items={['BODY', 'GLOW', 'SCREEN', 'EYES', 'MATERIAL.001']}
        />

        <Specs />

        {/* full-bleed bubble type band: the display words as art */}
        <section className="type-band" aria-label="Axiom display">
          {/* full-bleed display word, straight across the field */}
          <BubbleType
            src="/type-robotics.png?v=3"
            alt="Robotics"
            ratio={1465 / 396}
            className="type-band__bleed"
            scrollStart="top 96%"
          />

          <div className="type-band__inner">
            <BubbleType
              src="/type-axiom.png?v=3"
              alt="Axiom"
              ratio={1076 / 421}
              className="type-band__mark"
              scrollStart="top 92%"
            />
            <div className="type-band__copy">
              <span className="kicker__index">DISPLAY 03</span>
              <h2 className="type-band__title">
                BIG TYPE,
                <br />
                <span className="red">NO NOISE.</span>
              </h2>
              <p>
                Everything set in the display face is set once and set large. The word beside it is
                a different material entirely — extruded blue letterforms shot as artwork, keyed to
                a real alpha channel so they sit on the yellow field instead of on a picture of it.
              </p>
              <HoverBoxes
                columns={2}
                items={[
                  { label: 'Exploration', meta: 'Section 03', href: '#section-explore' },
                  { label: 'Specifications', meta: 'Section 04', href: '#section-specs' },
                  { label: 'Finale', meta: 'Section 05', href: '#section-final' },
                  { label: 'Restart', meta: 'Section 01', href: '#section-hero' },
                ]}
              />
            </div>
          </div>
        </section>

        <Marquee
          variant="sky"
          reverse
          speed={34}
          items={['THREE HUNDRED AND SIXTY DEGREES', 'SAME ASSET', 'SAME GEOMETRY', 'SAME CLIP']}
        />

        <Finale />
      </main>
    </div>
  )
}
