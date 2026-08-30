"use client"

import { useEffect, useState } from "react"
import { getInitial } from "@/lib/realtime"
import { firebaseProjectId } from "@/lib/firebase"

export function FirebaseConnectionBanner() {
  const [status, setStatus] = useState<"loading" | "ok" | "empty" | "error">("loading")
  const [studentCount, setStudentCount] = useState(0)
  const [errorHint, setErrorHint] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const students = await getInitial<{ id: string }>("students")
        if (cancelled) return
        setStudentCount(students.length)
        setStatus(students.length > 0 ? "ok" : "empty")
        if (students.length === 0) {
          setErrorHint(
            "Firestore returned 0 students. Check browser DevTools → Console for permission-denied or API key errors.",
          )
        }
      } catch (e) {
        if (cancelled) return
        setStatus("error")
        setErrorHint(e instanceof Error ? e.message : "Failed to load Firestore data")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (status === "loading" || status === "ok") return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
      <div
        role="alert"
        className="rounded-lg border border-amber-500/50 bg-amber-50 text-amber-950 px-4 py-3 text-sm"
      >
        <p className="font-medium">Firestore sync issue</p>
        <p className="mt-1 text-amber-900/90">
          Project: <code className="font-mono">{firebaseProjectId}</code>
          {studentCount === 0 && status === "empty" && " — connected but no student documents returned."}
        </p>
        {errorHint && <p className="mt-2 text-xs opacity-90">{errorHint}</p>}
        <p className="mt-2 text-xs opacity-90">
          In Vercel env vars use values only (no quotes or commas). In Google Cloud → Credentials →
          API key, allow your site URL under HTTP referrers (e.g.{" "}
          <code className="font-mono">https://*.vercel.app/*</code>).
        </p>
      </div>
    </div>
  )
}
