const COOKIE_NAME = "mts-school-mirror"
const SESSION_MAX_AGE = 60 * 60 * 12

export function getSchoolMirrorPassword(): string {
  return (
    process.env.SCHOOL_MIRROR_PASSWORD ||
    process.env.NEXT_PUBLIC_SCHOOL_MIRROR_PASSWORD ||
    "SuperAdmin123!"
  ).trim()
}

export function verifySchoolMirrorPassword(password: string): boolean {
  return password.trim() === getSchoolMirrorPassword()
}

export function getSchoolMirrorCookieOptions() {
  return {
    name: COOKIE_NAME,
    value: "1" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  }
}

/** @deprecated Client cookie helpers kept for backwards compatibility during migration */
export function setSchoolMirrorSession(): void {
  if (typeof document === "undefined") return
  document.cookie = `${COOKIE_NAME}=1; path=/; max-age=${SESSION_MAX_AGE}; SameSite=Lax`
}

export function clearSchoolMirrorSession(): void {
  if (typeof document === "undefined") return
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`
}

export function hasSchoolMirrorSession(): boolean {
  if (typeof document === "undefined") return false
  return document.cookie.split(";").some((c) => c.trim().startsWith(`${COOKIE_NAME}=1`))
}

export { COOKIE_NAME, SESSION_MAX_AGE }
