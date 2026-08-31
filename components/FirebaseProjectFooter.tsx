"use client"

import { useEffect, useState } from "react"
import {
  firebaseProjectId,
  expectedFirebaseProjectId,
  firebaseSchoolLabel,
  blockedSchoolNamePatterns,
} from "@/lib/firebase"
import { subscribe } from "@/lib/realtime"

export function FirebaseProjectFooter() {
  const [schoolName, setSchoolName] = useState<string | null>(null)

  useEffect(() => {
    const unsub = subscribe<{ schoolName?: string; id?: string }>("settings", (docs) => {
      const match =
        docs.find((d) => d.id === "app")?.schoolName ||
        docs.find((d) => d.schoolName)?.schoolName ||
        docs[0]?.schoolName
      setSchoolName(match?.trim() || null)
    })
    return () => unsub()
  }, [])

  const projectOk = firebaseProjectId === expectedFirebaseProjectId
  const normalizedSchool = schoolName?.toLowerCase() || ""
  const looksLikeWrongSchool = blockedSchoolNamePatterns.some((pattern) =>
    normalizedSchool.includes(pattern),
  )
  const schoolOk =
    !schoolName ||
    (!looksLikeWrongSchool &&
      (normalizedSchool === firebaseSchoolLabel.toLowerCase() ||
        normalizedSchool.includes("praise")))

  return (
    <p className="text-center text-[11px] text-slate-500 py-3 border-t">
      Firestore: <code className="font-mono">{firebaseProjectId}</code>
      {schoolName && (
        <>
          {" · "}
          School: <code className="font-mono">{schoolName}</code>
        </>
      )}
      {!projectOk && (
        <span className="text-amber-700">
          {" "}
          — expected project <code className="font-mono">{expectedFirebaseProjectId}</code>
        </span>
      )}
      {!schoolOk && (
        <span className="text-red-700">
          {" "}
          — expected school &quot;{firebaseSchoolLabel}&quot;. Firestore may contain another
          school&apos;s data.
        </span>
      )}
    </p>
  )
}
