/**
 * Local end-to-end test: Firestore read, mirror API, and login flow.
 * Run from web mirror folder: node scripts/test-local-mirror.mjs
 */
import { readFileSync } from "fs"
import { initializeApp } from "firebase/app"
import { getFirestore, collection, getDocs } from "firebase/firestore"

const BASE = process.env.MIRROR_BASE_URL || "http://localhost:3000"
const PASSWORD = process.env.SCHOOL_MIRROR_PASSWORD || "SuperAdmin123!"

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

async function testMirrorApi() {
  console.log("\n2) School mirror API (requires dev server + login cookie)")
  const loginRes = await fetch(`${BASE}/api/school/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: PASSWORD }),
  })
  const loginBody = await loginRes.json()
  console.log("   Login:", loginRes.status, loginBody)

  const cookie = loginRes.headers.get("set-cookie")?.split(";")[0]
  if (!cookie) {
    console.error("   FAIL: No session cookie from login")
    return 0
  }

  const studentsRes = await fetch(`${BASE}/api/mirror/students`, {
    headers: { Cookie: cookie },
  })
  const studentsText = await studentsRes.text()
  console.log("   GET /api/mirror/students:", studentsRes.status)
  if (!studentsRes.ok) {
    console.error("   Body:", studentsText.slice(0, 300))
    return 0
  }

  const students = JSON.parse(studentsText)
  console.log("   Students via mirror API:", students.length)
  students.slice(0, 3).forEach((s) => console.log("   -", s.id, s.fullName))
  return students.length
}

async function main() {
  console.log("Testing web mirror at", BASE)
  const cfg = loadEnv()
  const clientCount = await testClientFirestore(cfg)

  try {
    const apiCount = await testMirrorApi()
    console.log("\nSummary")
    console.log("   Client SDK students:", clientCount)
    console.log("   Mirror API students:", apiCount)
    if (clientCount > 0 && apiCount === 0) {
      console.error("\nFAIL: Firestore has data but mirror API returned zero.")
      process.exit(1)
    }
    if (clientCount === 0) {
      console.warn("\nWARN: Firestore has no students — run desktop sync first.")
    } else {
      console.log("\nOK: Sync data is readable.")
    }
  } catch (error) {
    console.error("\nMirror API test skipped/failed:", error.message)
    console.log("   (Start dev server: npm run dev)")
    if (clientCount > 0) {
      console.log("   Client SDK can read Firestore — UI issue may be mirror-API-only routing.")
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
