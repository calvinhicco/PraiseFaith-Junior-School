import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getAdminDb } from "@/lib/firebaseAdmin"
import { COOKIE_NAME } from "@/lib/schoolAuth"

function isSchoolMirrorAuthenticated(): boolean {
  return cookies().get(COOKIE_NAME)?.value === "1"
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
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
    const snap = await db.collection("students").doc(params.id).get()
    if (!snap.exists) return NextResponse.json(null)
    return NextResponse.json({ id: snap.id, ...snap.data() })
  } catch (error) {
    console.error(`Mirror student read failed for ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to read student." }, { status: 500 })
  }
}
