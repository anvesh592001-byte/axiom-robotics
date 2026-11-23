import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import Particles from './Particles'

/**
 * Pastel light studio.
 *
 * Instead of a dark lab, the machine is lit by a soft product-photography rig:
 * a warm (butter yellow) key, a cool sky-blue fill, a violet rim from behind and
 * a bounce card under the chin. The scene background is transparent so the page's
 * pastel gradient is what you actually see behind the robot — the canvas and the
 * DOM share one continuous backdrop.
 */
export default function Lab3D({ quality = 'high' }) {
  const keyRef = useRef()
  const fillRef = useRef()
  const rimRef = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    // slow, breathing studio lights — never a flash, always alive
    if (keyRef.current) keyRef.current.intensity = 2.35 + Math.sin(t * 0.55) * 0.22
    if (fillRef.current) fillRef.current.intensity = 1.15 + Math.sin(t * 0.42 + 1.1) * 0.14
    if (rimRef.current) rimRef.current.intensity = 2.0 + Math.cos(t * 0.36) * 0.24
  })

  return (
    <>
      {/* ── studio lighting ──────────────────────────────────────────── */}
      <ambientLight intensity={0.55} color="#fffdf5" />
      <hemisphereLight args={['#ffd97a', '#9ad6ff', 0.5]} />

      <directionalLight
        ref={keyRef}
        position={[3.6, 6.2, 4.2]}
        intensity={2.35}
        color="#fff3c4"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0006}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      <directionalLight ref={fillRef} position={[-5, 2.6, 3.4]} intensity={1.15} color="#a5dcff" />
      <directionalLight ref={rimRef} position={[-1.4, 3.4, -5.2]} intensity={2.0} color="#c8b8ff" />
      {/* bounce card under the chin keeps the underside from going muddy */}
      <pointLight position={[0.6, 0.35, 2.2]} intensity={0.9} color="#fff0b8" distance={7} decay={2} />

      {/* ── environment (generated on the GPU, zero network) ──────────── */}
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={2.2} form="rect" position={[0, 5, -2]} scale={[10, 5, 1]} color="#fffdf2" />
        <Lightformer intensity={1.7} form="rect" position={[-5, 1.6, 1]} scale={[5, 7, 1]} color="#bfe4ff" />
        <Lightformer intensity={1.5} form="rect" position={[5, 2, -1]} scale={[5, 7, 1]} color="#ffe08a" />
        <Lightformer intensity={1.0} form="circle" position={[0, -2, 2]} scale={[7, 7, 1]} color="#d8c9ff" />
      </Environment>

      <Particles />


    </>
  )
}
