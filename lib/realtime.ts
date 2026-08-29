import {
  fetchAppSettings as fetchFirebaseAppSettings,
  getInitial as getFirebaseInitial,
  subscribe as subscribeFirebase,
  subscribeAppSettings as subscribeFirebaseAppSettings,
  subscribeDoc,
} from "./firebase"
import {
  loadViaMirrorApi,
  subscribeSettingsViaMirrorApi,
  subscribeStudentViaMirrorApi,
  subscribeViaMirrorApi,
} from "./mirrorApi"

function isSchoolMirrorRoute(): boolean {
  return typeof window !== "undefined" && window.location.pathname.startsWith("/school")
}

export async function getInitial<T>(collectionName: string): Promise<T[]> {
  if (isSchoolMirrorRoute()) {
    return loadViaMirrorApi<T>(collectionName)
  }
  return getFirebaseInitial<T>(collectionName)
}

export function subscribe<T>(collectionName: string, cb: (docs: T[]) => void) {
  if (isSchoolMirrorRoute()) {
    return subscribeViaMirrorApi<T>(collectionName, cb)
  }
  return subscribeFirebase<T>(collectionName, cb)
}

export function subscribeOne<T>(
  collectionName: string,
  id: string,
  cb: (doc: T | null) => void,
) {
  if (isSchoolMirrorRoute() && collectionName === "students") {
    return subscribeStudentViaMirrorApi<T>(id, cb)
  }
  return subscribeDoc<T>(collectionName, id, cb)
}

export async function fetchAppSettings<T = Record<string, unknown>>(): Promise<T | null> {
  if (isSchoolMirrorRoute()) {
    const res = await fetch("/api/mirror/settings", { credentials: "include" })
    if (!res.ok) return null
    return (await res.json()) as T | null
  }
  return fetchFirebaseAppSettings<T>()
}

export function subscribeAppSettings<T = Record<string, unknown>>(
  cb: (settings: T | null) => void,
) {
  if (isSchoolMirrorRoute()) {
    return subscribeSettingsViaMirrorApi<T>(cb)
  }
  return subscribeFirebaseAppSettings<T>(cb)
}
