import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { modelStore } from '../lib/modelStore'
import { scrollState } from './timeline'
import CameraRig from './CameraRig'
import RobotModel from './RobotModel'
import StudioGrid from './StudioGrid'
import Lab3D from './Lab3D'
import Bubbles from './Bubbles'
import PostFX from './PostFX'
import { sceneBridge } from './sceneBridge'

/** Publishes the live renderer info for the HUD (no React state churn). */
function RenderStats() {
  const { gl } = useThree()
  useEffect(() => {
    sceneBridge.gl = gl
    if (import.meta.env.DEV) window.__axiomBridge = sceneBridge
  }, [gl])
  return null
}

function SceneContents({ quality }) {
  const robotRef = useRef(null)
  return (
    <>
      <CameraRig robotRef={robotRef} />
      <Lab3D quality={quality} />
      <StudioGrid />
      <Bubbles />
      <Suspense fallback={null}>
        <RobotModel groupRef={robotRef} />
      </Suspense>
      <RenderStats />
    </>
  )
}

/**
 * The single persistent WebGL canvas. It is mounted once for the lifetime of
 * the page (fixed, full-screen, behind the DOM) — scrolling moves the camera,
 * never the canvas — which is what makes the experience feel like one
 * continuous cinematic shot instead of a stack of sections.
 */
export default function Scene() {
  // Subscribe to the status only: the byte-progress ticks during loading must
  // not re-render the canvas tree.
  const [status, setStatus] = useState(() => modelStore.get().status)
  useEffect(() => modelStore.subscribe((s) => setStatus(s.status)), [])
  const [quality, setQuality] = useState('high')
  const [post, setPost] = useState(true)
  const [dpr, setDpr] = useState([1, 1.75])
  const [lost, setLost] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    scrollState.reducedMotion = reduce
    const small = window.innerWidth < 820 || (navigator.hardwareConcurrency || 4) <= 4
    if (small) {
      setQuality('low')
      setPost(false)
      setDpr([1, 1.35])
    }
  }, [])

  const cameraProps = useMemo(
    () => ({ position: [4.2, 2.1, 3.2], fov: 38, near: 0.1, far: 60 }),
    [],
  )

  return (
    <div className="scene-layer" aria-hidden="true">
      <Canvas
        shadows={quality === 'high'}
        dpr={dpr}
        camera={cameraProps}
        gl={{
          antialias: quality === 'high',
          alpha: true,
          premultipliedAlpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        onCreated={({ gl, scene }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 0.96
          gl.shadowMap.type = THREE.PCFSoftShadowMap
          // transparent surface: the pastel page gradient shows through and the
          // canvas reads as part of the page rather than a black video rect
          gl.setClearColor(0x000000, 0)
          scene.background = null
          sceneBridge.renderer = gl
          // Signal the loading overlay that the first frame is imminent.
          requestAnimationFrame(() => {
            scrollState.ready = true
            window.__axiomCanvasReady = true
            window.dispatchEvent(new CustomEvent('axiom:canvas-ready'))
          })
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault()
            setLost(true)
            console.error('[webgl] context lost')
          })
          gl.domElement.addEventListener('webglcontextrestored', () => {
            setLost(false)
            console.info('[webgl] context restored')
          })
        }}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: status === 'ready' ? 1 : 0.001,
          transition: 'opacity 1.1s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <Suspense fallback={null}>
          <SceneContents quality={quality} />
        </Suspense>
        <PostFX enabled={post && !lost} />
      </Canvas>
      {lost && (
        <div className="gl-lost">
          <span>GPU CONTEXT LOST</span>
          <p>Attempting to restore the WebGL surface…</p>
        </div>
      )}
    </div>
  )
}
