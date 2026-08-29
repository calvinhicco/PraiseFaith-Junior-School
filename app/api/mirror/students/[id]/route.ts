import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { readFirestoreCollection } from "@/lib/firestoreServerBridge"
import { COOKIE_NAME } from "@/lib/schoolAuth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

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

  const students = readFirestoreCollection<{ id: string }>("students")
  const student = students.find((entry) => entry.id === params.id) || null
  return NextResponse.json(student)
}
