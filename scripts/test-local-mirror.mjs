/**
 * Local Firestore read test for the web mirror.
 * Run from web mirror folder: node scripts/test-local-mirror.mjs
 */
import { readFileSync } from "fs"
import { initializeApp } from "firebase/app"
import { getFirestore, collection, getDocs } from "firebase/firestore"

const BASE = process.env.MIRROR_BASE_URL || "http://localhost:3000"

function loadEnv() {
  const cfg = {}
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const idx = trimmed.indexOf("=")
    if (idx === -1) continue
    cfg[trimmed.slice(0, idx)] = trimmed.slice(idx + 1)
  }
  return cfg
}

async function testClientFirestore(cfg) {
  console.log("\n1) Client Firestore SDK")
  console.log("   Project:", cfg.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
  const app = initializeApp({
    apiKey: cfg.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: cfg.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: cfg.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: cfg.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: cfg.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: cfg.NEXT_PUBLIC_FIREBASE_APP_ID,
  })
  const db = getFirestore(app)
  const snap = await getDocs(collection(db, "students"))
  console.log("   Students in Firestore:", snap.size)
  snap.docs.slice(0, 3).forEach((d) => {
    console.log("   -", d.id, d.data().fullName || d.data().studentName)
  })
  return snap.size
}

async function main() {
  console.log("Testing web mirror at", BASE)
  const cfg = loadEnv()
  const clientCount = await testClientFirestore(cfg)

  console.log("\nSummary")
  console.log("   Client SDK students:", clientCount)

  if (clientCount > 0) {
    console.log("\nOK: Sync data is readable.")
    process.exit(0)
  }

  console.error("\nFAIL: Firestore returned zero students.")
  process.exit(1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
