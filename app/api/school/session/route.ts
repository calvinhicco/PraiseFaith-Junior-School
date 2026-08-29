import { NextResponse } from "next/server"
import { COOKIE_NAME } from "@/lib/schoolAuth"

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie") || ""
  const authenticated = cookie.split(";").some((part) => part.trim() === `${COOKIE_NAME}=1`)
  return NextResponse.json({ authenticated })
}
