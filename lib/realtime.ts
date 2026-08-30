import {
  fetchAppSettings,
  getInitial as getFirebaseInitial,
  subscribe as subscribeFirebase,
  subscribeAppSettings,
  subscribeDoc,
} from "./firebase"

export async function getInitial<T>(collectionName: string): Promise<T[]> {
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

export { fetchAppSettings, subscribeAppSettings }
