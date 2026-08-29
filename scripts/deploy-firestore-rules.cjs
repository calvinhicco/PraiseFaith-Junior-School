const fs = require("fs")
const path = require("path")
const crypto = require("crypto")

const projectId = "praisefaith-junior-school"
const keyCandidates = [
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
  path.join(__dirname, "..", "..", "My Students Track + POS Module 3 June 2026", "firebase-service-account.json"),
  "C:/Users/ChiccoPC/Downloads/praisefaith service key/firebase-service-account.json",
  "C:/Program Files/My Students Track/firebase-service-account.json",
].filter(Boolean)
const keyFile = keyCandidates.find((candidate) => fs.existsSync(candidate))
const rulesPath = path.join(__dirname, "..", "firestore.rules")

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "")
}

function signJwt(serviceAccount, scopes) {
  const now = Math.floor(Date.now() / 1000)
  const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }))
  const payload = base64UrlEncode(
    JSON.stringify({
      iss: serviceAccount.client_email,
      sub: serviceAccount.client_email,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
      scope: scopes.join(" "),
    }),
  )
  const unsigned = `${header}.${payload}`
  const signature = crypto
    .createSign("RSA-SHA256")
    .update(unsigned)
    .sign(serviceAccount.private_key, "base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "")
  return `${unsigned}.${signature}`
}

async function getAccessToken(serviceAccount) {
  const jwt = signJwt(serviceAccount, [
    "https://www.googleapis.com/auth/cloud-platform",
    "https://www.googleapis.com/auth/firebase",
  ])
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  })
  const body = await res.json()
  if (!res.ok) {
    throw new Error(`Token request failed: ${JSON.stringify(body)}`)
  }
  return body.access_token
}

async function deployRules() {
  if (!keyFile) {
    throw new Error(`Service account not found. Checked: ${keyCandidates.join(", ")}`)
  }

  const serviceAccount = JSON.parse(fs.readFileSync(keyFile, "utf8"))
  if (serviceAccount.project_id !== projectId) {
    throw new Error(`Service account project_id is ${serviceAccount.project_id}, expected ${projectId}`)
  }

  const accessToken = await getAccessToken(serviceAccount)
  const rules = fs.readFileSync(rulesPath, "utf8")

  const createRes = await fetch(
    `https://firebaserules.googleapis.com/v1/projects/${projectId}/rulesets`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: {
          files: [{ name: "firestore.rules", content: rules }],
        },
      }),
    },
  )
  const createBody = await createRes.json()
  if (!createRes.ok) {
    throw new Error(`Ruleset create failed: ${JSON.stringify(createBody)}`)
  }
  console.log("Created ruleset:", createBody.name)

  const releaseRes = await fetch(
    `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases/cloud.firestore`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        updateMask: "rulesetName",
        release: {
          name: `projects/${projectId}/releases/cloud.firestore`,
          rulesetName: createBody.name,
        },
      }),
    },
  )
  const releaseBody = await releaseRes.json()
  if (!releaseRes.ok) {
    throw new Error(`Release failed: ${JSON.stringify(releaseBody)}`)
  }
  console.log("Released rules to cloud.firestore")
}

deployRules().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
