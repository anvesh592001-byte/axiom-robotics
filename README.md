# AXIOM // R-01 — pastel studio 3D robot portfolio

A single-page, scroll-directed 3D presentation built around the supplied GLB asset.

**Palette:** sky blue 20% · pastel yellow 70% · violet 10% on a light studio
backdrop. No dark surfaces anywhere — the WebGL canvas is transparent and the
page gradient is the scene background.

**Layout contract:** the machine and the copy never share pixels. The camera
timeline carries horizontal (`shift`) and vertical (`sy`) framing per keyframe,
so the robot holds the right of frame in the hero/exploration/finale and the left
during the specification readout, on both desktop and portrait.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run preview  # serve the production bundle on :4173
```

## The robot

`public/robot.glb` is the decoded binary from `uploads/cute_robot_base64.txt`
(131,100 bytes, glTF 2.0, validated on decode and again at runtime).

| Verified fact | Value |
| --- | --- |
| Meshes / draw calls | 7 |
| Materials | 5 — BODY, GLOW, SCREEN, Material.001, EYES |
| Vertices / triangles | 2,497 / 3,218 |
| Embedded textures / skins | 0 / 0 |
| Animation clips | 1 — `Animation`, 0.583 s, 2 morph-target tracks |
| Bounds (W×H×D) | 1.4949 × 2.0886 × 1.7492 u |
| Source | "cute robot" by victory_mirosya — CC-BY-4.0 (Sketchfab) |

Geometry, materials and the clip are used as authored. `src/data/modelInfo.js`
holds only these extracted values — nothing on the page is invented.

Loading pipeline (`src/lib/modelStore.js`): fetch → streamed byte progress →
GLB header/chunk validation → `GLTFLoader.parse` → cached module-level result,
so the asset is decoded once per page load and never on re-render. Every failure
path sets an error state surfaced by the boot overlay with its exact code
(`E_NETWORK`, `E_HTTP_*`, `E_GLB_MAGIC`, `E_GLB_LENGTH`, `E_GLB_CHUNK`,
`E_GLTf_PARSE`, …).

## Kinetic motion

- Per-character headline reveals (`src/ui/Chars.jsx`) — GSAP stagger + 3D rotate.
- Scroll-velocity skew: big type blocks lean with the Lenis velocity and spring
  back (`src/ui/MotionLayer.jsx`, one rAF, writes transforms directly).
- Magnetic CTAs that lean toward the pointer.
- Four full-bleed kinetic type ribbons (`src/ui/Marquee.jsx`) in sky, violet and
  butter variants, plus drifting pastel blobs behind the canvas.
- Everything above is disabled under `prefers-reduced-motion`.

## Lighting

Pastel product-photography rig instead of the old dark lab: warm butter key with
soft contact shadow, sky-blue fill, violet rim from behind, in-memory Lightformer
environment, and a faint perspective floor grid that fades out at its edges.

## How the experience is driven

- `src/scene/timeline.js` — one scroll value (0 → 1) sampled through a
  Catmull-Rom keyframe spline: camera azimuth, radius, elevation, focal length,
  screen-space shift and the robot's own Y rotation (a full 360°).
- `src/scene/CameraRig.jsx` — applies the spline with frame-rate-independent
  damping, then adds the pointer parallax on top, so mouse and scroll compose.
- Lenis drives the window scroll and is ticked by GSAP; ScrollTrigger handles the
  DOM reveals. One clock, no competing rAF loops.
- The WebGL canvas is fixed and mounted once — scrolling moves the camera, not
  the page sections over a static image.

Performance: DPR capped, shadows/post-processing disabled on low-power and
narrow devices, particles animated in the vertex shader, HUD/markers updated via
direct style writes in a single rAF loop (no React re-render per frame), all
listeners and the GSAP ticker cleaned up on unmount.
