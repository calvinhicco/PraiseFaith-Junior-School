import fs from "fs"
import path from "path"
import admin from "firebase-admin"
import type { Firestore } from "firebase-admin/firestore"

const LOCAL_SERVICE_ACCOUNT = path.join(
  process.cwd(),
  "..",
  "My Students Track + POS Module 3 June 2026",
  "firebase-service-account.json",
)

function readServiceAccount(): admin.ServiceAccount | null {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()
  if (json) {
    try {
      return JSON.parse(json) as admin.ServiceAccount
    } catch (error) {
      console.error("Invalid FIREBASE_SERVICE_ACCOUNT_JSON:", error)
    }
  }

  const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim() || LOCAL_SERVICE_ACCOUNT
  if (filePath && fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, "utf8")) as admin.ServiceAccount
    } catch (error) {
      console.error(`Could not read service account at ${filePath}:`, error)
    }
  }

  return null
}

export function getAdminDb(): Firestore | null {
  try {
    if (!admin.apps.length) {
      const serviceAccount = readServiceAccount()
      if (!serviceAccount) return null
      const projectId =
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ||
        (serviceAccount as { project_id?: string }).project_id
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        ...(projectId ? { projectId } : {}),
      })
    }
    return admin.firestore()
  } catch (error) {
    console.error("Firebase Admin init failed:", error)
    return null
  }
}
