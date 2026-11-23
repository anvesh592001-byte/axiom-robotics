import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { PIVOT, sampleTimeline, scrollState } from './timeline'
import { sceneBridge } from './sceneBridge'

/**
 * Drives the whole cinematic presentation from one value: scroll progress.
 *
 * - Orbit position comes from the Catmull-Rom keyframe spline.
 * - Pointer input adds a damped parallax on top of that orbit, so mouse and
 *   scroll compose instead of fighting each other.
 * - Everything is damped with an exponential (frame-rate independent) smoothing
 *   so the camera glides and never jitters, even with a high-DPI trackpad or a
 *   jump-scroll from the navigation.
 */
const smoothstep = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

export default function CameraRig({ robotRef }) {
  const { camera, size } = useThree()

  const smoothed = useRef({ az: 0, r: 4.55, elev: 0.17, shift: 0, sy: 0, rot: 0, fov: 38, entry: 0 })
  const tmp = useMemo(
    () => ({
      pivot: PIVOT.clone(),
      camPos: new THREE.Vector3(),
      look: new THREE.Vector3(),
      forward: new THREE.Vector3(),
      right: new THREE.Vector3(),
      upScreen: new THREE.Vector3(),
      worldUp: new THREE.Vector3(0, 1, 0),
    }),
    [],
  )
  const initialised = useRef(false)

  useEffect(() => {
    sceneBridge.setCamera(camera)
    return () => sceneBridge.setCamera(null)
  }, [camera])

  useFrame((state, rawDelta) => {
    // clamp delta so a tab-switch can never teleport the camera
    const delta = Math.min(rawDelta, 1 / 30)
    const portrait = size.width < 820
    const s = sampleTimeline(scrollState.progress)
    const sm = smoothed.current

    // frame-rate independent exponential smoothing
    const damp = (current, target, lambda) =>
      current + (target - current) * (1 - Math.exp(-lambda * delta))

    // pointer is smoothed once, here, and only here
    const p = scrollState.pointer
    p.x = damp(p.x, scrollState.pointerTarget.x, 2.4)
    p.y = damp(p.y, scrollState.pointerTarget.y, 2.4)

    // Time-based entry so the reveal takes the same 1.6 s on a 144 Hz laptop
    // and on a slow software renderer (damping alone would stretch it).
    const t = state.clock.elapsedTime
    const e = Math.min(1, Math.max(0, t / 1.6))
    sm.entry = e * e * (3 - 2 * e)
    sm.az = damp(sm.az, s.az, 6)
    sm.r = damp(sm.r, s.r, 5)
    sm.elev = damp(sm.elev, s.elev, 5)
    sm.shift = damp(sm.shift, s.shift, 4)
    sm.sy = damp(sm.sy, s.sy, 4)
    sm.rot = damp(sm.rot, s.rot, 6)
    sm.fov = damp(sm.fov, s.fov, 3)

    const introOut = 1 - sm.entry // 1 on the very first frames → 0 when arrived

    // ── orbit ──────────────────────────────────────────────────────────────
    const az = sm.az + p.x * 0.34
    const elev = THREE.MathUtils.clamp(sm.elev + p.y * 0.19 - introOut * 0.12, -0.18, 1.25)
    const radius =
      sm.r *
      (portrait ? 1.64 : 1) *
      (1 + introOut * 1.15) *
      (1 - Math.abs(p.x) * 0.025) *
      (1 - Math.abs(p.y) * 0.02)

    const cosE = Math.cos(elev)
    tmp.camPos.set(
      PIVOT.x + Math.cos(az) * cosE * radius,
      PIVOT.y + Math.sin(elev) * radius + introOut * 0.9,
      PIVOT.z + Math.sin(az) * cosE * radius,
    )

    // ── screen-space pan (keeps the robot off-centre next to the copy) ─────
    tmp.forward.copy(tmp.pivot).sub(tmp.camPos).normalize()
    tmp.right.crossVectors(tmp.forward, tmp.worldUp).normalize()
    tmp.upScreen.crossVectors(tmp.right, tmp.forward).normalize()

    // `shift` is a fraction of the viewport width, so the robot keeps the same
    // compositional position on a phone, a laptop and an ultrawide.
    const halfH = radius * Math.tan(THREE.MathUtils.degToRad(camera.fov) * 0.5)
    const aspect = camera.aspect || 1.7
    const halfW = halfH * aspect
    // The look-at target moves opposite to the subject: shifting the target to
    // the left is what pushes the robot to the right of frame.
    const panX = portrait ? 0 : -sm.shift * 2 * halfW
    // `sy` lifts/lowers the subject so it clears the copy in every section;
    // on portrait the robot is raised above the stacked copy as well
    // portrait raises the machine further off centre: the stacked copy sits
    // under it, and the frame is too narrow for the two to share a row. Past
    // the hero it lifts a further step so the copy in every later section
    // clears it as it scrolls past.
    const portraitLift = 0.2 * smoothstep(0.055, 0.13, scrollState.progress)
    const panY = portrait ? halfH * (-0.58 - portraitLift + sm.sy * 0.4) : halfH * sm.sy

    // Dev-only handle for visual regression checks (no effect in production).
    if (import.meta.env.DEV) {
      window.__axiomDebug = { az, radius, elev, panX, panY, robotRot: robotRef?.current?.rotation.y }
    }

    tmp.look
      .copy(tmp.pivot)
      .addScaledVector(tmp.right, panX)
      .addScaledVector(tmp.upScreen, panY)

    if (!initialised.current) {
      camera.position.copy(tmp.camPos)
      initialised.current = true
    } else {
      // gentle positional damping on top of the spline (no stutter, no lag)
      camera.position.lerp(tmp.camPos, 1 - Math.exp(-9 * delta))
    }
    // apply the (damped) focal length first so the frame we render is the
    // frame the screen-space pan above was computed against
    if (Math.abs(camera.fov - sm.fov) > 0.01) {
      camera.fov = sm.fov
      camera.updateProjectionMatrix()
    }

    camera.up.copy(tmp.worldUp)
    camera.lookAt(tmp.look)

    // ── robot presentation ────────────────────────────────────────────────
    const robot = robotRef?.current
    if (robot) {
      robot.rotation.y = sm.rot + p.x * 0.075
      robot.rotation.x = -p.y * 0.018
      robot.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.018
      robot.scale.setScalar(1 + introOut * 0.55)
    }
  })

  return null
}
