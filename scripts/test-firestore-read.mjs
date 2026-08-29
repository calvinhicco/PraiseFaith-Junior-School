import { readFileSync } from "fs"
import { initializeApp } from "firebase/app"
import { getFirestore, collection, getDocs } from "firebase/firestore"

const envText = readFileSync(".env.local", "utf8")
const cfg = {}
for (const line of envText.split(/\r?\n/)) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith("#")) continue
  const idx = trimmed.indexOf("=")
  if (idx === -1) continue
  cfg[trimmed.slice(0, idx)] = trimmed.slice(idx + 1)
}

console.log("Project:", cfg.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
const app = initializeApp({
  apiKey: cfg.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: cfg.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: cfg.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: cfg.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: cfg.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: cfg.NEXT_PUBLIC_FIREBASE_APP_ID,
})
const db = getFirestore(app)

try {
  const snap = await getDocs(collection(db, "students"))
  console.log("Client SDK students count:", snap.size)
  if (snap.size > 0) {
    console.log("First student:", snap.docs[0].id, snap.docs[0].data().fullName)
  }
} catch (error) {
  console.error("CLIENT READ ERROR:", error.code, error.message)
  process.exit(1)
}
