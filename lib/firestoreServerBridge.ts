import fs from "fs"
import path from "path"
import { JWT } from "google-auth-library"

type ServiceAccount = {
  client_email: string
  private_key: string
  project_id?: string
  projectId?: string
}

const LOCAL_SERVICE_ACCOUNT = path.join(
  process.cwd(),
  "..",
  "My Students Track + POS Module 3 June 2026",
  "firebase-service-account.json",
)

function readServiceAccount(): ServiceAccount {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()
  if (json) return JSON.parse(json) as ServiceAccount

  const configured = process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim()
  const filePath = configured
    ? path.isAbsolute(configured)
      ? configured
      : path.resolve(process.cwd(), configured)
    : LOCAL_SERVICE_ACCOUNT

  return JSON.parse(fs.readFileSync(filePath, "utf8")) as ServiceAccount
}

function decodeValue(value: Record<string, unknown>): unknown {
  if ("stringValue" in value) return value.stringValue
  if ("integerValue" in value) return Number(value.integerValue)
  if ("doubleValue" in value) return value.doubleValue
  if ("booleanValue" in value) return value.booleanValue
  if ("nullValue" in value) return null
  if ("timestampValue" in value) return value.timestampValue
  if ("arrayValue" in value) {
    const arrayValue = value.arrayValue as { values?: Record<string, unknown>[] }
    return (arrayValue.values || []).map((entry) => decodeValue(entry))
  }
  if ("mapValue" in value) {
    const mapValue = value.mapValue as { fields?: Record<string, Record<string, unknown>> }
    const out: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(mapValue.fields || {})) {
      out[key] = decodeValue(val)
    }
    return out
  }
  return null
}

function documentFromRest(doc: {
  name: string
  fields?: Record<string, Record<string, unknown>>
}) {
  const id = doc.name.split("/").pop() || ""
  const data: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(doc.fields || {})) {
    data[key] = decodeValue(value)
  }
  return { id, ...data }
}

export async function readFirestoreCollection<T extends { id: string }>(
  collectionName: string,
): Promise<T[]> {
  try {
    const sa = readServiceAccount()
    const projectId =
      sa.project_id || sa.projectId || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim()
    if (!projectId || !sa.client_email || !sa.private_key) {
      console.error(`Firestore read misconfigured for ${collectionName}`)
      return []
    }

    const client = new JWT({
      email: sa.client_email,
      key: String(sa.private_key).replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/datastore"],
    })
    const token = (await client.getAccessToken()).token
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) {
      console.error(`Firestore REST read failed for ${collectionName}:`, await res.text())
      return []
    }

    const body = (await res.json()) as { documents?: Parameters<typeof documentFromRest>[0][] }
    return (body.documents || []).map(documentFromRest) as T[]
  } catch (error) {
    console.error(`Firestore read failed for ${collectionName}:`, error)
    return []
  }
}
