import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  type Firestore,
} from "firebase/firestore"

let app: FirebaseApp | undefined
let db: Firestore | undefined

function getConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  }
}

export function getDb(): Firestore {
  if (!db) {
    const config = getConfig()
    if (!config.apiKey || !config.projectId) {
      throw new Error("Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* in .env.local")
    }
    if (!app) {
      app = getApps().length ? getApps()[0] : initializeApp(config)
    }
    db = getFirestore(app)
  }
  return db
}

function tryGetDb(): Firestore | null {
  try {
    return getDb()
  } catch (error) {
    console.error("Firebase is not configured:", error)
    return null
  }
}

export function isFirebaseConfigured(): boolean {
  const c = getConfig()
  return Boolean(c.apiKey && c.projectId)
}

export async function getInitial<T>(collectionName: string): Promise<T[]> {
  try {
    const snap = await getDocs(collection(getDb(), collectionName))
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T)
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error)
    return []
  }
}

export function subscribe<T>(collectionName: string, cb: (docs: T[]) => void) {
  try {
    return onSnapshot(
      collection(getDb(), collectionName),
      (snap) => {
        cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T))
      },
      (error) => {
        console.error(`Error subscribing to ${collectionName}:`, error)
        cb([])
      },
    )
  } catch (error) {
    console.error(`Error setting up subscription for ${collectionName}:`, error)
    return () => {}
  }
}

export function subscribeDoc<T>(
  collectionName: string,
  docId: string,
  cb: (data: T | null) => void,
) {
  try {
    return onSnapshot(
      doc(getDb(), collectionName, docId),
      (snap) => {
        cb(snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null)
      },
      (error) => {
        console.error(`Error subscribing to ${collectionName}/${docId}:`, error)
        cb(null)
      },
    )
  } catch (error) {
    console.error(`Error setting up doc subscription for ${collectionName}/${docId}:`, error)
    return () => {}
  }
}

const SETTINGS_DOC_IDS = ["app", "appSettings"] as const

export async function fetchAppSettings<T = Record<string, unknown>>(): Promise<T | null> {
  const db = tryGetDb()
  if (!db) return null

  try {
    for (const id of SETTINGS_DOC_IDS) {
      const snap = await getDoc(doc(db, "settings", id))
      if (snap.exists()) return snap.data() as T
    }
    const all = await getDocs(collection(db, "settings"))
    if (all.empty) return null
    return all.docs[0].data() as T
  } catch (error) {
    console.error("Error fetching app settings:", error)
    return null
  }
}

export function subscribeAppSettings<T = Record<string, unknown>>(
  cb: (settings: T | null) => void,
) {
  const db = tryGetDb()
  if (!db) {
    cb(null)
    return () => {}
  }

  try {
    return onSnapshot(
      collection(db, "settings"),
      (snap) => {
        if (snap.empty) {
          cb(null)
          return
        }
        for (const id of SETTINGS_DOC_IDS) {
          const match = snap.docs.find((d) => d.id === id)
          if (match) {
            cb(match.data() as T)
            return
          }
        }
        cb(snap.docs[0].data() as T)
      },
      (error) => {
        console.error("Error subscribing to settings:", error)
        cb(null)
      },
    )
  } catch (error) {
    console.error("Error setting up settings subscription:", error)
    cb(null)
    return () => {}
  }
}
