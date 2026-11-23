import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from './timeline'

/**
 * Solid violet orbs orbiting the machine.
 *
 * Rules this file encodes:
 *  - Opaque. Alpha is exactly 1.0; the volume is sold by shading, not by
 *    transparency.
 *  - Orbiting. Every orb travels a full 360° revolution around the robot, each
 *    at its own angular speed, direction and inclination, so the ring keeps
 *    turning and never lines up. Orbs on the far side are occluded by the
 *    machine's opaque body; orbs on the near side swing wide of its silhouette
 *    because the orbit radius (>= 2.4 world units) is greater than the robot's
 *    own radius (~1.2), so nothing ever covers the face.
 *  - Moving. On top of the orbit, each orb bobs on its own phase and breathes
 *    in radius, so the field is never still and never repeats.
 *
 * One InstancedMesh, one draw call.
 */

const COUNT = 22
const TMP = new THREE.Object3D()

const vertexShader = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vNormalV;
  varying vec3 vViewDir;

  void main() {
    vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
    vNormalV = normalize(normalMatrix * mat3(instanceMatrix) * normal);
    vViewDir = normalize(cameraPosition - world.xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

// Opaque violet ball. The gradient is taken in *view* space so the light always
// falls across the visible disc no matter where the camera orbits, which is
// what makes a filled sphere read as a sphere rather than a flat circle.
const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uShade;
  uniform vec3 uLight;
  varying vec3 vNormalW;
  varying vec3 vNormalV;
  varying vec3 vViewDir;

  void main() {
    vec3 nv = normalize(vNormalV);
    vec3 n = normalize(vNormalW);
    vec3 v = normalize(vViewDir);

    // Screen-space light axis: bright up-left, deep down-right.
    vec2 axis = normalize(vec2(-0.52, 0.78));
    float t = dot(nv.xy, axis);
    vec3 col = mix(uShade, uColor, smoothstep(-0.72, 0.82, t));

    // Silhouette tightens to a deeper violet, as a real ball's edge does.
    float rim = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 3.2);
    col = mix(col, uShade * 1.15, rim * 0.5);

    // Tight specular dot on the up-left shoulder.
    float spec = pow(clamp(dot(nv, normalize(vec3(-0.42, 0.6, 0.68))), 0.0, 1.0), 30.0);
    col += uLight * spec * 0.8;

    gl_FragColor = vec4(col, 1.0);
  }
`

export default function Bubbles() {
  const meshRef = useRef()

  const orbs = useMemo(() => {
    const list = []
    const rand = (a, b) => a + Math.random() * (b - a)
    for (let i = 0; i < COUNT; i++) {
      const big = i < 4
      list.push({
        // Spread evenly around the ring at t=0, then each turns at its own rate.
        start: (i / COUNT) * Math.PI * 2 + rand(-0.2, 0.2),
        // Radians per second; sign flips so some rings counter-rotate.
        speed: rand(0.1, 0.26) * (i % 4 === 0 || i % 7 === 0 ? -1 : 1),
        // Orbit size as a multiple of the live camera distance, so the ring
        // stays framed whether the shot is a wide hero or a close inspection.
        radiusFactor: big ? rand(0.82, 1.02) : rand(0.72, 1.08),
        // Vertical squash of the orbit ring — not every orb rides the equator.
        ySquash: big ? rand(0.55, 0.95) : rand(0.35, 1.0),
        yRef: big ? rand(0.62, 1.05) : rand(0.3, 1.15),
        scale: big ? rand(0.058, 0.085) : rand(0.022, 0.05),
        bobAmp: rand(0.12, 0.34),
        bobFreq: rand(0.35, 0.9),
        phase: rand(0, Math.PI * 2),
        spin: rand(0.15, 0.5),
      })
    }
    return list
  }, [])

  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color('#9d6bff') },
      uShade: { value: new THREE.Color('#2d0a9c') },
      uLight: { value: new THREE.Color('#efe6ff') },
    }),
    [],
  )

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh) return
    const t = state.clock.elapsedTime
    const slow = scrollState.reducedMotion ? 0.35 : 1
    const cam = state.camera.position
    const px = state.pointer.x * 0.14
    const py = state.pointer.y * 0.1
    // Camera distance to the machine's waist drives the orbit size.
    const dist = Math.hypot(cam.x, cam.y - 1.0, cam.z)
    // Narrow viewports get a tighter ring so the field stays in the robot's
    // half of the screen and never drifts across the copy below it.
    const narrow = state.size.width < 760 ? 0.7 : 1
    const ring = THREE.MathUtils.clamp(dist * 0.62, 1.65, 3.9) * narrow

    for (let i = 0; i < orbs.length; i++) {
      const o = orbs[i]
      const a = o.start + t * o.speed * slow
      const breathe = Math.sin(t * o.bobFreq * slow + o.phase)
      const r = ring * o.radiusFactor + Math.cos(t * 0.21 * slow + o.phase * 1.7) * 0.16
      const baseY = 1.0 + (o.yRef - 0.7) * ring * 0.55
      const y = baseY + breathe * o.bobAmp + Math.sin(t * 0.15 * slow + o.phase) * 0.14
      TMP.position.set(Math.sin(a) * r + px, 1.0 + (y - 1.0) * o.ySquash + py, Math.cos(a) * r)
      TMP.rotation.set(0, t * o.spin, 0)
      TMP.scale.setScalar(o.scale * (1 + breathe * 0.12))
      TMP.updateMatrix()
      mesh.setMatrixAt(i, TMP.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <sphereGeometry args={[1, 24, 18]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={false}
        depthWrite
        depthTest
        side={THREE.FrontSide}
      />
    </instancedMesh>
  )
}
