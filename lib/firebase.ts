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
import { SCHOOL_NAME } from "./schoolConfig"

function envVar(name: string, fallback: string): string {
  const raw = process.env[name]
  if (!raw || !raw.trim()) return fallback
  return raw.replace(/^["'\s]+|["',\s]+$/g, "")
}

/** PraiseFaith only — leftover Vercel env from another school is ignored. */
export const expectedFirebaseProjectId = "praisefaith-junior-school"
export const firebaseSchoolLabel = SCHOOL_NAME

const SCHOOL_FIREBASE = {
  apiKey: "AIzaSyBCpajdj01oLa4HRalaUpo2ODOvyI2rqfM",
  authDomain: "praisefaith-junior-school.firebaseapp.com",
  projectId: expectedFirebaseProjectId,
  storageBucket: "praisefaith-junior-school.firebasestorage.app",
  messagingSenderId: "95874105499",
  appId: "1:95874105499:web:589ff457a9302eb41ec63e",
  measurementId: "G-THV8L2GVQS",
}

const BLOCKED_FIREBASE_PROJECT_IDS = [
  "connect-group-of-schools",
  "bubbles-web-mirror",
  "my-students-mirror",
  "my-students-track-staff-online",
  "jan-2026-webmirror-a1",
  "school-29-march-26",
]

export const blockedSchoolNamePatterns = [
  "connect group",
  "bubble beginnings",
  "madam boss",
  "sunrise",
  "grace junior",
]

function resolveFirebaseConfig() {
  const fromEnv = {
    apiKey: envVar("NEXT_PUBLIC_FIREBASE_API_KEY", SCHOOL_FIREBASE.apiKey),
    authDomain: envVar("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", SCHOOL_FIREBASE.authDomain),
    projectId: envVar("NEXT_PUBLIC_FIREBASE_PROJECT_ID", SCHOOL_FIREBASE.projectId),
    storageBucket: envVar("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", SCHOOL_FIREBASE.storageBucket),
    messagingSenderId: envVar(
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      SCHOOL_FIREBASE.messagingSenderId,
    ),
    appId: envVar("NEXT_PUBLIC_FIREBASE_APP_ID", SCHOOL_FIREBASE.appId),
    measurementId: envVar(
      "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID",
      SCHOOL_FIREBASE.measurementId,
    ),
  }

  if (
    BLOCKED_FIREBASE_PROJECT_IDS.includes(fromEnv.projectId) ||
    fromEnv.projectId !== expectedFirebaseProjectId
  ) {
    console.error(
      `Unexpected Firebase project "${fromEnv.projectId}". ` +
        `Expected "${expectedFirebaseProjectId}". Using built-in PraiseFaith config.`,
    )
    return { ...SCHOOL_FIREBASE }
  }

  return fromEnv
}

const firebaseConfig = resolveFirebaseConfig()

export const firebaseProjectId = firebaseConfig.projectId

let app: FirebaseApp | undefined
let db: Firestore | undefined

export function getDb(): Firestore {
  if (!db) {
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      throw new Error("Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* in .env.local")
    }
    if (!app) {
      app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
    }
    db = getFirestore(app)
  }
  return db
}

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)
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
  const db = getDb()
  for (const id of SETTINGS_DOC_IDS) {
    const snap = await getDoc(doc(db, "settings", id))
    if (snap.exists()) return snap.data() as T
  }
  const all = await getDocs(collection(db, "settings"))
  if (all.empty) return null
  return all.docs[0].data() as T
}

export function subscribeAppSettings<T = Record<string, unknown>>(
  cb: (settings: T | null) => void,
) {
  const db = getDb()
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
}
