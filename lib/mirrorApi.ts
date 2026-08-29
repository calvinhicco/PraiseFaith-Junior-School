import { isMirrorCollection } from "./mirrorCollections"

const MIRROR_POLL_MS = 15_000

function canUseMirrorApi(): boolean {
  return typeof window !== "undefined" && window.location.pathname.startsWith("/school")
}

async function fetchMirrorCollection<T>(collectionName: string): Promise<T[]> {
  if (!canUseMirrorApi() || !isMirrorCollection(collectionName)) return []

  try {
    const res = await fetch(`/api/mirror/${collectionName}`, { credentials: "include" })
    if (!res.ok) return []
    return (await res.json()) as T[]
  } catch (error) {
    console.error(`Mirror API fetch failed for ${collectionName}:`, error)
    return []
  }
}

async function fetchMirrorSettings<T>(): Promise<T | null> {
  if (!canUseMirrorApi()) return null

  try {
    const res = await fetch("/api/mirror/settings", { credentials: "include" })
    if (!res.ok) return null
    return (await res.json()) as T | null
  } catch (error) {
    console.error("Mirror settings fetch failed:", error)
    return null
  }
}

async function fetchMirrorStudent<T>(id: string): Promise<T | null> {
  if (!canUseMirrorApi()) return null

  try {
    const res = await fetch(`/api/mirror/students/${encodeURIComponent(id)}`, {
      credentials: "include",
    })
    if (!res.ok) return null
    return (await res.json()) as T | null
  } catch (error) {
    console.error(`Mirror student fetch failed for ${id}:`, error)
    return null
  }
}

export async function loadViaMirrorApi<T>(collectionName: string): Promise<T[]> {
  return fetchMirrorCollection<T>(collectionName)
}

export function subscribeViaMirrorApi<T>(
  collectionName: string,
  cb: (docs: T[]) => void,
): () => void {
  if (!canUseMirrorApi() || !isMirrorCollection(collectionName)) {
    return () => {}
  }

  let cancelled = false

  const refresh = async () => {
    const docs = await fetchMirrorCollection<T>(collectionName)
    if (!cancelled) cb(docs)
  }

  void refresh()
  const timer = window.setInterval(() => {
    void refresh()
  }, MIRROR_POLL_MS)

  return () => {
    cancelled = true
    window.clearInterval(timer)
  }
}

export function subscribeSettingsViaMirrorApi<T>(cb: (settings: T | null) => void): () => void {
  if (!canUseMirrorApi()) return () => {}

  let cancelled = false

  const refresh = async () => {
    const settings = await fetchMirrorSettings<T>()
    if (!cancelled) cb(settings)
  }

  void refresh()
  const timer = window.setInterval(() => {
    void refresh()
  }, MIRROR_POLL_MS)

  return () => {
    cancelled = true
    window.clearInterval(timer)
  }
}

export function subscribeStudentViaMirrorApi<T>(
  id: string,
  cb: (doc: T | null) => void,
): () => void {
  if (!canUseMirrorApi()) return () => {}

  let cancelled = false

  const refresh = async () => {
    const doc = await fetchMirrorStudent<T>(id)
    if (!cancelled) cb(doc)
  }

  void refresh()
  const timer = window.setInterval(() => {
    void refresh()
  }, MIRROR_POLL_MS)

  return () => {
    cancelled = true
    window.clearInterval(timer)
  }
}
