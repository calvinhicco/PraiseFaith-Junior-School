import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { readFirestoreCollection } from "@/lib/firestoreServerBridge"
import { isMirrorCollection } from "@/lib/mirrorCollections"
import { COOKIE_NAME } from "@/lib/schoolAuth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

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

  const docs = await readFirestoreCollection(collection)
  return NextResponse.json(docs)
}
