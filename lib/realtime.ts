import {
  fetchAppSettings as fetchFirebaseAppSettings,
  getInitial as getFirebaseInitial,
  subscribe as subscribeFirebase,
  subscribeAppSettings as subscribeFirebaseAppSettings,
  subscribeDoc,
} from "./firebase"
import { loadViaMirrorApi } from "./mirrorApi"

function isSchoolMirrorRoute(): boolean {
  return typeof window !== "undefined" && window.location.pathname.startsWith("/school")
}

async function loadSchoolCollection<T>(collectionName: string): Promise<T[]> {
  const fromClient = await getFirebaseInitial<T>(collectionName)
  if (fromClient.length > 0) return fromClient

  if (isSchoolMirrorRoute()) {
    const fromApi = await loadViaMirrorApi<T>(collectionName)
    if (fromApi.length > 0) return fromApi
  }

  return fromClient
}

export async function getInitial<T>(collectionName: string): Promise<T[]> {
  if (isSchoolMirrorRoute()) {
    return loadSchoolCollection<T>(collectionName)
  }
  return getFirebaseInitial<T>(collectionName)
}

export function subscribe<T>(collectionName: string, cb: (docs: T[]) => void) {
  return subscribeFirebase<T>(collectionName, cb)
}

export function subscribeOne<T>(
  collectionName: string,
  id: string,
  cb: (doc: T | null) => void,
) {
  return subscribeDoc<T>(collectionName, id, cb)
}

export async function fetchAppSettings<T = Record<string, unknown>>(): Promise<T | null> {
  const fromClient = await fetchFirebaseAppSettings<T>()
  if (fromClient) return fromClient

  if (isSchoolMirrorRoute()) {
    try {
      const res = await fetch("/api/mirror/settings", { credentials: "include" })
      if (res.ok) return (await res.json()) as T | null
    } catch {
      /* optional fallback */
    }
  }

  return null
}

export function subscribeAppSettings<T = Record<string, unknown>>(
  cb: (settings: T | null) => void,
) {
  return subscribeFirebaseAppSettings<T>(cb)
}
