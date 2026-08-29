import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getAdminDb } from "@/lib/firebaseAdmin"
import { COOKIE_NAME } from "@/lib/schoolAuth"

const SETTINGS_DOC_IDS = ["app", "appSettings"] as const

function isSchoolMirrorAuthenticated(): boolean {
  return cookies().get(COOKIE_NAME)?.value === "1"
}

export async function GET() {
  if (!isSchoolMirrorAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const db = getAdminDb()
  if (!db) {
    return NextResponse.json(
      { error: "Firebase Admin is not configured on the server." },
      { status: 503 },
    )
  }

  try {
    for (const id of SETTINGS_DOC_IDS) {
      const snap = await db.collection("settings").doc(id).get()
      if (snap.exists) {
        return NextResponse.json(snap.data())
      }
    }

    const all = await db.collection("settings").limit(1).get()
    if (all.empty) return NextResponse.json(null)
    return NextResponse.json(all.docs[0].data())
  } catch (error) {
    console.error("Mirror settings read failed:", error)
    return NextResponse.json({ error: "Failed to read settings." }, { status: 500 })
  }
}
