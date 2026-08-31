"use client"

import { useEffect, useState } from "react"
import { getInitial } from "@/lib/realtime"
import {
  firebaseProjectId,
  firebaseSchoolLabel,
  blockedSchoolNamePatterns,
} from "@/lib/firebase"

export function FirebaseConnectionBanner() {
  const [status, setStatus] = useState<"loading" | "ok" | "empty" | "wrong-school" | "error">(
    "loading",
  )
  const [studentCount, setStudentCount] = useState(0)
  const [schoolName, setSchoolName] = useState<string | null>(null)
  const [errorHint, setErrorHint] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [students, settings] = await Promise.all([
          getInitial<{ id: string }>("students"),
          getInitial<{ schoolName?: string; id?: string }>("settings"),
        ])
        if (cancelled) return

        const settingsSchool =
          settings.find((d) => d.id === "app")?.schoolName?.trim() ||
          settings.find((d) => d.schoolName)?.schoolName?.trim() ||
          null
        setSchoolName(settingsSchool)
        setStudentCount(students.length)

        const normalized = settingsSchool?.toLowerCase() || ""
        const wrongSchool =
          !!settingsSchool &&
          blockedSchoolNamePatterns.some((p) => normalized.includes(p))

        if (wrongSchool) {
          setStatus("wrong-school")
          setErrorHint(
            `Firestore settings show "${settingsSchool}" but this site is for "${firebaseSchoolLabel}". ` +
              "Fix Vercel env vars or desktop sync.",
          )
        } else if (students.length > 0) {
          setStatus("ok")
        } else {
          setStatus("empty")
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

  const isWrongSchool = status === "wrong-school"

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
      <div
        role="alert"
        className={
          isWrongSchool
            ? "rounded-lg border border-red-500/50 bg-red-50 text-red-950 px-4 py-3 text-sm"
            : "rounded-lg border border-amber-500/50 bg-amber-50 text-amber-950 px-4 py-3 text-sm"
        }
      >
        <p className="font-medium">
          {isWrongSchool ? "Wrong school data in Firestore" : "Firestore sync issue"}
        </p>
        <p className="mt-1 opacity-90">
          Project: <code className="font-mono">{firebaseProjectId}</code>
          {schoolName && (
            <>
              {" · "}
              School in Firestore: <code className="font-mono">{schoolName}</code>
            </>
          )}
          {studentCount === 0 && status === "empty" && " — connected but no student documents returned."}
        </p>
        {errorHint && <p className="mt-2 text-xs opacity-90">{errorHint}</p>}
      </div>
    </div>
  )
}
