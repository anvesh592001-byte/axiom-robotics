import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { createStore } from './store'

/**
 * One-shot robot asset pipeline.
 *
 *  - The GLB is fetched exactly once per page load, streamed so real byte
 *    progress can be displayed, then validated (glTF magic + chunk table)
 *    before it ever reaches the renderer.
 *  - The parsed gltf object is cached at module scope, so React re-renders,
 *    HMR unmounts or section changes never decode it again.
 *  - Every failure path lands in `status: 'error'` with a technical message
 *    that the UI surfaces instead of silently pretending the model loaded.
 */
export const MODEL_URL = '/robot.glb'

export const modelStore = createStore({
  status: 'idle', // idle | loading | decoding | ready | error
  progress: 0,
  received: 0,
  total: 0,
  error: null,
  gltf: null,
  duration: 0,
})

let inflight = null
let cachedGltf = null

function fail(code, detail) {
  const err = new Error(`${code}: ${detail}`)
  err.code = code
  err.detail = detail
  console.error('[robot] load failed', err)
  modelStore.set({ status: 'error', error: err, progress: 0 })
  return null
}

function validateGlb(buffer) {
  if (!buffer || buffer.byteLength < 20) {
    throw Object.assign(new Error('E_GLB_TRUNCATED: asset is smaller than a GLB header'), {
      code: 'E_GLB_TRUNCATED',
    })
  }
  const head = new Uint8Array(buffer, 0, 4)
  const magic = String.fromCharCode(head[0], head[1], head[2], head[3])
  if (magic !== 'glTF') {
    throw Object.assign(new Error(`E_GLB_MAGIC: expected "glTF", received "${magic}"`), {
      code: 'E_GLB_MAGIC',
    })
  }
  const view = new DataView(buffer)
  const version = view.getUint32(4, true)
  const declared = view.getUint32(8, true)
  if (version !== 2) {
    throw Object.assign(new Error(`E_GLB_VERSION: unsupported glTF version ${version}`), {
      code: 'E_GLB_VERSION',
    })
  }
  if (declared !== buffer.byteLength) {
    throw Object.assign(
      new Error(`E_GLB_LENGTH: header declares ${declared} bytes, received ${buffer.byteLength}`),
      { code: 'E_GLB_LENGTH' },
    )
  }
  // Walk the chunk table so a corrupt JSON/BIN split is caught early.
  let offset = 12
  let chunks = 0
  while (offset + 8 <= buffer.byteLength) {
    const len = view.getUint32(offset, true)
    const type = view.getUint32(offset + 4, true)
    if (offset + 8 + len > buffer.byteLength) {
      throw Object.assign(new Error('E_GLB_CHUNK: chunk overruns file length'), {
        code: 'E_GLB_CHUNK',
      })
    }
    offset += 8 + len
    chunks += 1
  }
  if (chunks < 2) {
    throw Object.assign(new Error('E_GLB_CHUNK: missing JSON or BIN chunk'), {
      code: 'E_GLB_CHUNK',
    })
  }
  return { version, chunks, byteLength: buffer.byteLength }
}

async function readWithProgress(response) {
  const total = Number(response.headers.get('content-length')) || 0
  modelStore.set({ total })

  if (!response.body || !response.body.getReader) {
    const buf = await response.arrayBuffer()
    modelStore.set({ progress: 1, received: buf.byteLength })
    return buf
  }

  const reader = response.body.getReader()
  const chunks = []
  let received = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    received += value.byteLength
    const progress = total ? Math.min(0.97, received / total) : Math.min(0.9, received / 200000)
    modelStore.set({ progress, received })
  }
  const merged = new Uint8Array(received)
  let at = 0
  for (const c of chunks) {
    merged.set(c, at)
    at += c.byteLength
  }
  return merged.buffer
}

export function preloadRobot() {
  if (cachedGltf) {
    modelStore.set({ status: 'ready', progress: 1, gltf: cachedGltf })
    return Promise.resolve(cachedGltf)
  }
  if (inflight) return inflight

  const startedAt = performance.now()
  modelStore.set({ status: 'loading', error: null, progress: 0 })

  inflight = (async () => {
    try {
      let res
      try {
        res = await fetch(MODEL_URL, { cache: 'force-cache' })
      } catch (netErr) {
        return fail(
          'E_NETWORK',
          `could not fetch ${MODEL_URL} (${netErr?.message || 'network error'}). ` +
            'The asset must be served from the application origin.',
        )
      }
      if (!res.ok) {
        return fail('E_HTTP_' + res.status, `${MODEL_URL} responded ${res.status} ${res.statusText}`)
      }

      let buffer
      try {
        buffer = await readWithProgress(res)
      } catch (streamErr) {
        return fail('E_STREAM', `transfer interrupted: ${streamErr?.message || streamErr}`)
      }
      const info = validateGlb(buffer)
      console.info(
        `[robot] GLB validated — ${(info.byteLength / 1024).toFixed(1)} KB, glTF ${info.version}, ${info.chunks} chunks`,
      )

      modelStore.set({ status: 'decoding', progress: 0.99 })

      const loader = new GLTFLoader()
      const gltf = await new Promise((resolve, reject) => {
        loader.parse(buffer, '', resolve, (e) =>
          reject(
            Object.assign(new Error(`E_GLTF_PARSE: ${e?.message || 'parser rejected the asset'}`), {
              code: 'E_GLTF_PARSE',
            }),
          ),
        )
      })

      if (!gltf || !gltf.scene) return fail('E_GLTF_EMPTY', 'parser returned no scene graph')

      // Warm the frustum culling matrices before the first frame.
      gltf.scene.updateMatrixWorld(true)
      const box = new THREE.Box3().setFromObject(gltf.scene)
      if (box.isEmpty()) return fail('E_GLTF_EMPTY', 'scene contains no renderable geometry')

      cachedGltf = gltf
      modelStore.set({
        status: 'ready',
        progress: 1,
        gltf,
        duration: performance.now() - startedAt,
        bounds: {
          min: box.min.toArray(),
          max: box.max.toArray(),
          size: box.getSize(new THREE.Vector3()).toArray(),
        },
        stats: {
          meshes: (() => {
            let n = 0
            gltf.scene.traverse((o) => o.isMesh && (n += 1))
            return n
          })(),
          animations: gltf.animations?.length || 0,
        },
      })
      return gltf
    } catch (err) {
      const code = err.code || 'E_UNKNOWN'
      return fail(code, err.message || String(err))
    } finally {
      inflight = null
    }
  })()

  return inflight
}

export function disposeRobotCache() {
  cachedGltf = null
  modelStore.set({ status: 'idle', gltf: null, progress: 0 })
}
