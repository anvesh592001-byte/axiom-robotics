/**
 * Cinematic camera timeline.
 *
 * One normalised scroll value (0 → 1) drives a continuous camera orbit and a
 * full 360° rotation of the robot. Keyframes are interpolated with a uniform
 * Catmull-Rom spline so velocity stays continuous (no stutter at keyframes).
 *
 * Orbit convention: the camera sits on a sphere around the pivot.
 *   x = pivot.x + cos(az) * cos(elev) * radius
 *   y = pivot.y + sin(elev) * radius
 *   z = pivot.z + sin(az) * cos(elev) * radius
 * az = 0 puts the camera on the +X axis, which is the direction the model's
 * face/eyes point (verified: eyes at x = +0.473).
 */
import * as THREE from 'three'

export const PIVOT = new THREE.Vector3(-0.02, 1.02, 0)

/**
 * progress, azimuth, radius, elevation, screen shift, robot Y rotation, fov
 *
 * `shift` is a fraction of the viewport width (-1 → 1) that offsets the subject
 * horizontally, and `sy` the equivalent vertically — together they are what
 * guarantee the machine never sits under the copy at any aspect ratio.
 * `rot` is the robot's own Y rotation. What the viewer actually perceives is
 * `rel = rot + az` — the angle the face is presented at. The two are authored
 * together so that `rel` stays near 0 (face-on / three-quarter) at every beat
 * where copy is on screen, and carries the full 360° through the transitions
 * between panels.
 */
export const KEYFRAMES = [
  // p      az      r      elev   shift   sy     rot     fov
  // 0.00 — hero: copy left, the machine holds the right half, face on.
  //        close in (r 5.7) and sit slightly low (sy -0.03): the headline owns
  //        the upper left, the machine owns the right, nothing overlaps
  { p: 0.0, az: 0.5, r: 5.7, elev: 0.12, shift: 0.15, sy: -0.03, rot: 0.0, fov: 38 },
  // 0.12 — introduction: full-width statement type, machine lifts into the top band
  { p: 0.12, az: -0.5, r: 6.5, elev: 0.2, shift: 0.0, sy: -0.74, rot: 0.65, fov: 36 },
  // 0.26 — exploration: specimen pinned right, panel on the left, face visible
  { p: 0.26, az: 0.9, r: 4.9, elev: 0.06, shift: 0.21, sy: 0.02, rot: -0.55, fov: 34 },
  // 0.42 — exploration deep: low three-quarter, still right of frame
  { p: 0.42, az: 2.06, r: 4.45, elev: 0.2, shift: 0.21, sy: 0.02, rot: -1.31, fov: 33 },
  // 0.58 — the whip: between the two panels the camera swings behind while the
  //        machine carries the rest of its 360°, then both settle
  { p: 0.58, az: 3.38, r: 5.35, elev: 0.3, shift: -0.17, sy: 0.04, rot: 2.22, fov: 35 },
  // 0.72 — specifications: three-quarter again, left of the data table
  { p: 0.72, az: 4.58, r: 5.95, elev: 0.2, shift: -0.17, sy: 0.03, rot: 1.42, fov: 37 },
  // 0.86 — finale: copy back on the left, machine returns to the right
  { p: 0.86, az: 5.58, r: 6.3, elev: 0.1, shift: 0.12, sy: 0.0, rot: 0.57, fov: 38 },
  // 1.00 — hero composition revisited, face on
  { p: 1.0, az: Math.PI * 2, r: 5.85, elev: 0.12, shift: 0.15, sy: -0.03, rot: 0.5, fov: 38 },
]

const TRACKS = ['az', 'r', 'elev', 'shift', 'sy', 'rot', 'fov']

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

/** Uniform Catmull-Rom (a, b, c, d at t in [0,1]) */
function catmullRom(a, b, c, d, t) {
  const t2 = t * t
  const t3 = t2 * t
  return (
    0.5 *
    (2 * b +
      (-a + c) * t +
      (2 * a - 5 * b + 4 * c - d) * t2 +
      (-a + 3 * b - 3 * c + d) * t3)
  )
}

const smoothstep = (e0, e1, x) => {
  const t = clamp01((x - e0) / (e1 - e0))
  return t * t * (3 - 2 * t)
}

const scratch = { az: 0, r: 0, elev: 0, shift: 0, rot: 0, fov: 0 }

/** Sample the timeline. Returns a reused object — read fields immediately. */
export function sampleTimeline(progress) {
  const p = clamp01(progress)
  const n = KEYFRAMES.length

  // locate segment
  let i = 0
  while (i < n - 2 && p > KEYFRAMES[i + 1].p) i++
  const k1 = KEYFRAMES[i]
  const k2 = KEYFRAMES[i + 1]
  const k0 = KEYFRAMES[Math.max(0, i - 1)]
  const k3 = KEYFRAMES[Math.min(n - 1, i + 2)]
  const span = k2.p - k1.p || 1
  const t = clamp01((p - k1.p) / span)

  for (const key of TRACKS) {
    scratch[key] = catmullRom(k0[key], k1[key], k2[key], k3[key], t)
  }
  return scratch
}

/** 0 → 1 fade for the exploration hotspots. */
export function hotspotOpacity(progress) {
  const inA = smoothstep(0.19, 0.28, progress)
  const outA = 1 - smoothstep(0.46, 0.58, progress)
  return Math.min(inA, outA)
}

/**
 * The mode rail is part of the hero framing; it steps aside while the
 * exploration and specification panels occupy the screen.
 */
export function hudOpacity(progress) {
  // visible for the hero + introduction, then it retires for the rest of the
  // journey so nothing ever collides with the panels or the closing footer
  return 1 - smoothstep(0.1, 0.18, progress)
}

/** Live telemetry readouts for the HUD (screens never freeze). */
export function telemetry(progress) {
  const s = sampleTimeline(progress)
  return {
    azimuth: (THREE.MathUtils.radToDeg(s.az) % 360).toFixed(1),
    radius: s.r.toFixed(2),
    elevation: THREE.MathUtils.radToDeg(s.elev).toFixed(1),
    rotation: ((THREE.MathUtils.radToDeg(s.rot) % 360) + 360) % 360,
  }
}

/** Mutable, render-free channel shared between the DOM and the 3D scene. */
export const scrollState = {
  progress: 0,
  /** smoothed pointer, -1 → 1 */
  pointer: { x: 0, y: 0 },
  /** raw pointer target */
  pointerTarget: { x: 0, y: 0 },
  ready: false,
  reducedMotion: false,
  /** signed scroll velocity in px/frame, written by Lenis */
  velocity: 0,
}
