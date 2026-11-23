import { useSyncExternalStore } from 'react'

/**
 * Tiny external store (no dependency) so high-frequency state never has to
 * live in React and re-render the 3D tree.
 */
export function createStore(initial) {
  let state = initial
  const listeners = new Set()
  return {
    get: () => state,
    set: (patch) => {
      const next = typeof patch === 'function' ? patch(state) : patch
      if (!next) return
      let changed = false
      for (const k in next) {
        if (state[k] !== next[k]) {
          changed = true
          break
        }
      }
      if (!changed) return
      state = { ...state, ...next }
      listeners.forEach((l) => l(state))
    },
    subscribe: (fn) => {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
  }
}

export function useStore(store) {
  return useSyncExternalStore(store.subscribe, store.get, store.get)
}
