import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getAdminDb } from "@/lib/firebaseAdmin"
import { isMirrorCollection } from "@/lib/mirrorCollections"
import { COOKIE_NAME } from "@/lib/schoolAuth"

function isSchoolMirrorAuthenticated(): boolean {
  return cookies().get(COOKIE_NAME)?.value === "1"
}

export async function GET(
  _request: Request,
  { params }: { params: { collection: string } },
) {
  if (!isSchoolMirrorAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { collection } = params
  if (!isMirrorCollection(collection)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const db = getAdminDb()
  if (!db) {
    return NextResponse.json(
      { error: "Firebase Admin is not configured on the server." },
      { status: 503 },
    )
  }

  try {
    const snap = await db.collection(collection).get()
    const docs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json(docs)
  } catch (error) {
    console.error(`Mirror API read failed for ${collection}:`, error)
    return NextResponse.json({ error: "Failed to read Firestore data." }, { status: 500 })
  }
}
