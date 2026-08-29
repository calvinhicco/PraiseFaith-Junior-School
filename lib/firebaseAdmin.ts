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

function normalizeServiceAccount(raw: Record<string, unknown>): admin.ServiceAccount {
  return {
    projectId: String(raw.projectId || raw.project_id || ""),
    clientEmail: String(raw.clientEmail || raw.client_email || ""),
    privateKey: String(raw.privateKey || raw.private_key || ""),
  }
}

function readServiceAccount(): admin.ServiceAccount | null {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()
  if (json) {
    try {
      return normalizeServiceAccount(JSON.parse(json) as Record<string, unknown>)
    } catch (error) {
      console.error("Invalid FIREBASE_SERVICE_ACCOUNT_JSON:", error)
    }
  }

  const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim() || LOCAL_SERVICE_ACCOUNT
  if (filePath && fs.existsSync(filePath)) {
    try {
      return normalizeServiceAccount(
        JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<string, unknown>,
      )
    } catch (error) {
      console.error(`Could not read service account at ${filePath}:`, error)
    }
  }

  return null
}

export function getAdminDb(): Firestore | null {
  try {
    const serviceAccount = readServiceAccount()
    if (!serviceAccount?.clientEmail || !serviceAccount?.privateKey) return null

    const appName = "praisefaith-mirror-admin"
    const projectId =
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() || serviceAccount.projectId

    const existing = admin.apps.find((app) => app?.name === appName)
    if (!existing) {
      admin.initializeApp(
        {
          credential: admin.credential.cert(serviceAccount),
          projectId,
        },
        appName,
      )
    }

    return admin.app(appName).firestore()
  } catch (error) {
    console.error("Firebase Admin init failed:", error)
    return null
  }
}
