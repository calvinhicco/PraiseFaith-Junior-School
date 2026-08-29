const fs = require("fs")
const path = require("path")
const admin = require("firebase-admin")

const projectId = "praisefaith-junior-school"
const keyFile = "C:/Program Files/My Students Track/firebase-service-account.json"
const rulesPath = path.join(__dirname, "..", "firestore.rules")

async function deployRules() {
  const serviceAccount = JSON.parse(fs.readFileSync(keyFile, "utf8"))
  const credential = admin.credential.cert(serviceAccount)
  const tokenResult = await credential.getAccessToken()
  const accessToken = tokenResult.access_token
  if (!accessToken) throw new Error("Could not obtain access token")

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
