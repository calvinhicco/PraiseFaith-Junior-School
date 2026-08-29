/**
 * Read a Firestore collection via service account (stdout JSON).
 * Usage: node scripts/read-firestore-collection.cjs students
 */
const fs = require("fs")
const path = require("path")
const { JWT } = require("google-auth-library")

const collectionName = process.argv[2]
if (!collectionName) {
  console.error("Collection name required")
  process.exit(1)
}

const defaultAccount = path.join(
  process.cwd(),
  "..",
  "My Students Track + POS Module 3 June 2026",
  "firebase-service-account.json",
)

function readServiceAccount() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()
  if (json) return JSON.parse(json)

  const configured = process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim()
  const filePath = configured
    ? path.isAbsolute(configured)
      ? configured
      : path.resolve(process.cwd(), configured)
    : defaultAccount

  return JSON.parse(fs.readFileSync(filePath, "utf8"))
}

function decodeValue(value) {
  if ("stringValue" in value) return value.stringValue
  if ("integerValue" in value) return Number(value.integerValue)
  if ("doubleValue" in value) return value.doubleValue
  if ("booleanValue" in value) return value.booleanValue
  if ("nullValue" in value) return null
  if ("timestampValue" in value) return value.timestampValue
  if ("arrayValue" in value) {
    return (value.arrayValue.values || []).map((entry) => decodeValue(entry))
  }
  if ("mapValue" in value) {
    const out = {}
    for (const [key, val] of Object.entries(value.mapValue.fields || {})) {
      out[key] = decodeValue(val)
    }
    return out
  }
  return null
}

function documentFromRest(doc) {
  const id = doc.name.split("/").pop() || ""
  const data = {}
  for (const [key, value] of Object.entries(doc.fields || {})) {
    data[key] = decodeValue(value)
  }
  return { id, ...data }
}

async function main() {
  const sa = readServiceAccount()
  const projectId = sa.project_id || sa.projectId || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim()
  const client = new JWT({
    email: sa.client_email,
    key: String(sa.private_key).replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/datastore"],
  })
  const token = (await client.getAccessToken()).token
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) {
    console.error(await res.text())
    process.exit(2)
  }
  const body = await res.json()
  process.stdout.write(JSON.stringify((body.documents || []).map(documentFromRest)))
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
