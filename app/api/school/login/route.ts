import { NextResponse } from "next/server"
import { getSchoolMirrorCookieOptions, verifySchoolMirrorPassword } from "@/lib/schoolAuth"

export async function POST(request: Request) {
  let password = ""
  try {
    const body = (await request.json()) as { password?: string }
    password = body.password ?? ""
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 })
  }

  if (!verifySchoolMirrorPassword(password)) {
    return NextResponse.json({ ok: false, error: "Incorrect password" }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(getSchoolMirrorCookieOptions())
  return response
}
