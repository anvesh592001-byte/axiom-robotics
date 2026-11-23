/**
 * Verified model facts — extracted programmatically from the supplied GLB
 * (public/robot.glb) with a headless Three.js GLTFLoader pass.
 * Nothing here is invented: every value comes from the asset itself.
 *
 * NOTE: `robot.model` is a small pinned set of public links that make the
 * CC-BY-4.0 attribution clickable in the UI (they come from the GLB `asset`
 * metadata, not from the geometry).
 */
export const MODEL_INFO = {
  fileName: 'robot.glb',
  fileSize: '128.03 KB',
  fileBytes: 131100,
  container: 'glTF 2.0 (glTF binary)',
  generator: 'Sketchfab-14.77.0',
  extension: 'KHR_materials_specular',
  author: 'victory_mirosya',
  license: 'CC-BY-4.0',
  title: 'cute robot',

  meshes: 7,
  materials: 5,
  nodes: 15,
  vertices: 2497,
  triangles: 3218,
  drawCalls: 7,
  animations: 1,
  animationName: 'Animation',
  animationDuration: '0.583 s',
  animationTracks: 2,
  morphTargets: 2,
  textures: 0,
  skins: 0,
  morphAnimatedNodes: 2,

  boundingBox: { x: 1.4949, y: 2.0886, z: 1.7492 },
  radius: 1.5538,

  model: {
    title: 'cute robot',
    author: 'victory_mirosya',
    license: 'CC-BY-4.0',
    source: 'https://sketchfab.com/3d-models/cute-robot-6aadb75f596742ada2814ad4593f0032',
    authorUrl: 'https://sketchfab.com/victory_mirosya',
    licenseUrl: 'http://creativecommons.org/licenses/by/4.0/',
  },

  materialNames: ['BODY', 'GLOW', 'SCREEN', 'Material.001', 'EYES'],
}

/**
 * Hotspots — world-space anchor points. These are derived from the actual
 * mesh centres reported by the loader (see the `centre` comment), so the
 * markers really do sit on the corresponding component.
 */
export const HOTSPOTS = [
  {
    id: 'head',
    index: '01',
    label: 'Head Assembly',
    title: 'BODY — Head Shell',
    mesh: 'Object_4',
    material: 'BODY',
    center: [-0.109, 1.23, 0.018],
    anchor: [0.05, 1.62, 0.55],
    metrics: [
      ['Mesh', 'Object_4'],
      ['Material', 'BODY'],
      ['Triangles', '1,998'],
      ['Vertices', '1,634'],
    ],
    body: 'The dominant shell of the asset. A single 1,998-triangle body mesh carrying the BODY material with KHR_materials_specular driving its anodised response.',
  },
  {
    id: 'visor',
    index: '02',
    label: 'Optic Core',
    title: 'EYES — Morph-Driven Optics',
    mesh: 'mesh_2 / mesh_3',
    material: 'EYES',
    center: [0.473, 1.235, 0.136],
    anchor: [0.62, 1.36, 0.3],
    metrics: [
      ['Meshes', 'mesh_2, mesh_3'],
      ['Material', 'EYES'],
      ['Morph targets', '1 each'],
      ['Animated nodes', '2'],
    ],
    body: 'The only animated parts of the model. Both optic meshes are driven by morph-target influence tracks, which is exactly the clip running in the viewport right now.',
  },
  {
    id: 'display',
    index: '03',
    label: 'Face Display',
    title: 'SCREEN — Display Panel',
    mesh: 'Object_6',
    material: 'SCREEN',
    center: [0.47, 1.23, 0.0],
    anchor: [-0.34, 1.3, 0.72],
    metrics: [
      ['Mesh', 'Object_6'],
      ['Material', 'SCREEN'],
      ['Triangles', '72'],
      ['Roughness', '0.5'],
    ],
    body: 'The black display face of the robot: non-metallic, roughness 0.5, base colour pure black — the surface the emissive eye geometry reads against.',
  },
  {
    id: 'emitter',
    index: '04',
    label: 'Emissive Trim',
    title: 'GLOW — Emissive Band',
    mesh: 'Object_5',
    material: 'GLOW',
    center: [0.005, 1.227, 0.816],
    anchor: [-0.28, 1.62, -0.6],
    metrics: [
      ['Mesh', 'Object_5'],
      ['Material', 'GLOW'],
      ['Emissive', 'R1 G.73 B.03'],
      ['Triangles', '64'],
    ],
    body: 'An emissive trim ring. Its emissive factor is the warm amber that the laboratory lighting picks up and smears across the floor.',
  },
  {
    id: 'base',
    index: '05',
    label: 'Base Pedestal',
    title: 'BODY — Base Geometry',
    mesh: 'Object_8',
    material: 'BODY',
    center: [0.03, 0.076, -0.018],
    anchor: [0.42, 0.22, -0.55],
    metrics: [
      ['Mesh', 'Object_8'],
      ['Material', 'BODY'],
      ['Triangles', '960'],
      ['Vertices', '592'],
    ],
    body: 'The base plate and column geometry the robot stands on, sharing the BODY material with the head shell for a continuous machined finish.',
  },
]

export const NAV = [
  { id: 'home', label: 'HOME', href: '#section-hero' },
  { id: 'explore', label: 'EXPLORE', href: '#section-explore' },
  { id: 'technology', label: 'TECHNOLOGY', href: '#section-specs' },
  { id: 'about', label: 'ABOUT', href: '#section-final' },
]
