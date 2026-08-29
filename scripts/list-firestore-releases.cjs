const fs = require("fs")
const admin = require("firebase-admin")

const projectId = "praisefaith-junior-school"
const keyFile = "C:/Program Files/My Students Track/firebase-service-account.json"

async function main() {
  const serviceAccount = JSON.parse(fs.readFileSync(keyFile, "utf8"))
  const credential = admin.credential.cert(serviceAccount)
  const { access_token: accessToken } = await credential.getAccessToken()

  const listRes = await fetch(
    `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )
  console.log(await listRes.json())
}

main().catch(console.error)
