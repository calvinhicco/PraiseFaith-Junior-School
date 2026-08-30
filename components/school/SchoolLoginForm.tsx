"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Building2, Loader2, Lock } from "lucide-react"
import { SCHOOL_NAME } from "@/lib/schoolConfig"
import {
  hasSchoolMirrorSession,
  setSchoolMirrorSession,
  verifySchoolMirrorPassword,
} from "@/lib/schoolAuth"

export function SchoolLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (hasSchoolMirrorSession()) {
      const next = searchParams.get("next") || "/school"
      router.replace(next)
    }
  }, [router, searchParams])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!verifySchoolMirrorPassword(password)) {
      setError("Incorrect password. Contact your school administrator.")
      setLoading(false)
      return
    }

    setSchoolMirrorSession()
    const next = searchParams.get("next") || "/school"
    router.replace(next)
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg">
          <Building2 className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{SCHOOL_NAME}</h1>
        <p className="mt-2 text-sm text-slate-600">
          Staff read-only access to synced financial data from the desktop app.
        </p>
      </div>

      <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-slate-700" htmlFor="password">
          Staff password
        </label>
        <div className="relative mt-2">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            placeholder="Enter mirror password"
            required
          />
        </div>

        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        <Link href="/" className="text-brand-600 hover:underline">
          Back to portal chooser
        </Link>
      </p>
    </div>
  )
}
