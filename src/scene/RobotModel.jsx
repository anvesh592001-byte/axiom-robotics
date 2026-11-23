import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useAnimations } from '@react-three/drei'
import { useStore } from '../lib/store'
import { modelStore } from '../lib/modelStore'
import { sceneBridge } from './sceneBridge'

/**
 * The supplied robot, exactly as authored.
 *
 * The gltf object comes from the module-level cache in lib/modelStore, so the
 * GLB is fetched, validated and parsed once per page load; this component only
 * ever mounts a reference to the already-parsed scene graph.
 *
 * Geometry, materials, material names and the morph-target animation clip are
 * left untouched — only object flags needed by the renderer (shadows, frustum
 * culling) are set.
 */
export default function RobotModel({ groupRef }) {
  const { gltf } = useStore(modelStore)

  // Reuse the parsed scene graph as-is (single instance for the whole app).
  const scene = useMemo(() => gltf?.scene || null, [gltf])
  const clips = useMemo(() => gltf?.animations || [], [gltf])

  const innerRef = useRef()
  const { actions, names, mixer } = useAnimations(clips, innerRef)

  // Shadow setup + bridge publication. Runs once per mounted scene.
  useEffect(() => {
    if (!scene) return
    scene.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true
        o.receiveShadow = true
        if (o.material) o.material.envMapIntensity = 0.85
        o.frustumCulled = true
      }
    })
    const morphMeshes = []
    scene.traverse((o) => {
      if (o.isMesh && o.morphTargetInfluences?.length) morphMeshes.push(o)
    })
    sceneBridge.morphMeshes = morphMeshes
    if (groupRef?.current) sceneBridge.setRobot(groupRef.current)
    return () => sceneBridge.setRobot(null)
  }, [scene, groupRef])

  // Play the clip that ships inside the GLB (morph-target eye animation).
  useEffect(() => {
    if (!names.length) return
    const action = actions[names[0]]
    if (!action) return
    action.reset()
    action.setLoop(THREE.LoopRepeat, Infinity)
    action.clampWhenFinished = false
    action.fadeIn(0.4).play()
    console.info(`[robot] animation clip "${names[0]}" playing — ${clips[0]?.duration.toFixed(3)}s · loop ${action.loop === THREE.LoopRepeat ? "repeat" : action.loop}`)
    return () => {
      action.fadeOut(0.2)
      action.stop()
      mixer?.stopAllAction()
    }
  }, [actions, names, clips, mixer])

  if (!scene) return null

  return (
    <group ref={groupRef} name="robot-root">
      <group ref={innerRef} name="robot-animated">
        <primitive object={scene} />
      </group>
    </group>
  )
}
