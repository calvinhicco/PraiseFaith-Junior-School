"use client"

import { expectedFirebaseProjectId, firebaseProjectId, firebaseSchoolLabel } from "@/lib/firebase"

/** Shows which Firestore project the browser is using — helps catch wrong Vercel env vars. */
export function FirebaseProjectFooter() {
  const ok = firebaseProjectId === expectedFirebaseProjectId

  return (
    <p className="text-center text-[11px] text-slate-500 py-3 border-t">
      Firestore: <code className="font-mono">{firebaseProjectId}</code>
      {!ok && (
        <span className="text-amber-700">
          {" "}
          — expected <code className="font-mono">{expectedFirebaseProjectId}</code> for{" "}
          {firebaseSchoolLabel}
        </span>
      )}
    </p>
  )
}
