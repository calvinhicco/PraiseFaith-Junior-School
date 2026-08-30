const COOKIE_NAME = "mts-school-mirror"

export function getSchoolMirrorPassword(): string {
  return process.env.NEXT_PUBLIC_SCHOOL_MIRROR_PASSWORD || "SuperAdmin123!"
}

export function setSchoolMirrorSession(): void {
  if (typeof document === "undefined") return
  document.cookie = `${COOKIE_NAME}=1; path=/; max-age=${60 * 60 * 12}; SameSite=Lax`
}

export function clearSchoolMirrorSession(): void {
  if (typeof document === "undefined") return
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`
}

export function hasSchoolMirrorSession(): boolean {
  if (typeof document === "undefined") return false
  return document.cookie.split(";").some((c) => c.trim().startsWith(`${COOKIE_NAME}=1`))
}

export function verifySchoolMirrorPassword(password: string): boolean {
  return password === getSchoolMirrorPassword()
}

export { COOKIE_NAME }
