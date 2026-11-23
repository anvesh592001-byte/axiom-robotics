import { EffectComposer, Bloom, Vignette, SMAA } from '@react-three/postprocessing'
import { useMemo } from 'react'

/**
 * Light-studio grade: a warm halo on the machine's highlights, a whisper of
 * vignette to hold the pastel background together, and SMAA for clean edges.
 * The heavy grain/chromatic aberration of the dark theme would muddy a light
 * palette, so they are gone.
 */
export default function PostFX({ enabled = true }) {
  const vignette = useMemo(() => ({ offset: 0.42, darkness: 0.32 }), [])

  if (!enabled) return null

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom intensity={0.42} luminanceThreshold={0.78} luminanceSmoothing={0.28} mipmapBlur radius={0.56} />
      <Vignette eskil={false} offset={vignette.offset} darkness={vignette.darkness} />
      <SMAA />
    </EffectComposer>
  )
}
