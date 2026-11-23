import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Ambient confetti motes: pastel dots drifting upward behind the robot.
 * One Points draw call, animated entirely in the vertex shader, so it costs no
 * per-frame CPU work. On a light background these read as paper dust in a
 * sunlit studio rather than "sci-fi particles".
 */
const COUNT = 260

const vertexShader = /* glsl */ `
  attribute float aScale;
  attribute float aPhase;
  attribute vec3 aColor;
  uniform float uTime;
  uniform vec2 uPointer;
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vColor = aColor;
    vec3 pos = position;
    float t = uTime * 0.16 + aPhase * 6.2831;
    pos.y = mod(pos.y + uTime * (0.03 + aPhase * 0.045), 8.5) - 1.2;
    pos.x += sin(t) * 0.26;
    pos.z += cos(t * 0.8) * 0.26;
    pos.xy += uPointer * 0.2 * aScale;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aScale * (30.0 / -mv.z);
    vAlpha = smoothstep(0.0, 1.4, pos.y + 1.2) * 0.5;
  }
`

const fragmentShader = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.06, d);
    gl_FragColor = vec4(vColor, core * vAlpha);
  }
`

export default function Particles() {
  const matRef = useRef()
  const groupRef = useRef()

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const positions = new Float32Array(COUNT * 3)
    const scales = new Float32Array(COUNT)
    const phases = new Float32Array(COUNT)
    const colors = new Float32Array(COUNT * 3)
    const butter = new THREE.Color('#f2c41c')
    const sky = new THREE.Color('#5bb6ea')
    const violet = new THREE.Color('#9a7cf0')

    for (let i = 0; i < COUNT; i++) {
      const r = 1.6 + Math.random() * 5.6
      const a = Math.random() * Math.PI * 2
      positions[i * 3] = Math.cos(a) * r * 0.95
      positions[i * 3 + 1] = Math.random() * 8.5
      positions[i * 3 + 2] = Math.sin(a) * r * 0.95 - 1
      scales[i] = 0.16 + Math.random() * 0.55
      phases[i] = Math.random()

      const roll = Math.random()
      const c = roll > 0.62 ? butter : roll > 0.3 ? sky : violet
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }

    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
    g.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
    g.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 3, -1), 14)
    return g
  }, [])

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uPointer: { value: new THREE.Vector2(0, 0) } }),
    [],
  )

  useFrame((state) => {
    if (!matRef.current) return
    matRef.current.uniforms.uTime.value = state.clock.elapsedTime
    matRef.current.uniforms.uPointer.value.set(state.pointer.x * 0.5, state.pointer.y * 0.5)
    if (groupRef.current) groupRef.current.rotation.y = state.clock.elapsedTime * 0.014
  })

  return (
    <group ref={groupRef}>
      <points geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          ref={matRef}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </points>
    </group>
  )
}
