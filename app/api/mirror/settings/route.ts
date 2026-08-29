import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { readFirestoreCollection } from "@/lib/firestoreServerBridge"
import { COOKIE_NAME } from "@/lib/schoolAuth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function isSchoolMirrorAuthenticated(): boolean {
  return cookies().get(COOKIE_NAME)?.value === "1"
}

export async function GET() {
  if (!isSchoolMirrorAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const settingsDocs = readFirestoreCollection<Record<string, unknown>>("settings")
  const appDoc = settingsDocs.find((doc) => doc.id === "app" || doc.id === "appSettings")
  return NextResponse.json(appDoc || settingsDocs[0] || null)
}
