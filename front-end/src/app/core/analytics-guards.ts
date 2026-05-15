// Shared lightweight helpers for analytics guards.
// Kept separate to avoid polluting component state logic.

export function oncePerKey(key: string, store: Set<string>): boolean {
  if (store.has(key)) return false
  store.add(key)
  return true
}

