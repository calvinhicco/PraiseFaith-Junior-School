"use client"

import Link from "next/link"
import { Building2, GraduationCap } from "lucide-react"
import { SCHOOL_NAME } from "@/lib/schoolConfig"

export function PortalChooser() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg">
            <Building2 className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{SCHOOL_NAME}</h1>
          <p className="mt-2 text-slate-600">Choose how you want to access school information.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/parent"
            className="group rounded-2xl border border-brand-100 bg-white p-6 shadow-sm transition hover:border-brand-300 hover:shadow-md"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700 group-hover:bg-brand-600 group-hover:text-white">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Parent Portal</h2>
            <p className="mt-2 text-sm text-slate-600">
              View and download your child&apos;s academic results and report cards.
            </p>
          </Link>

          <Link
            href="/school/login"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-300 hover:shadow-md"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-brand-600 group-hover:text-white">
              <Building2 className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">School Mirror</h2>
            <p className="mt-2 text-sm text-slate-600">
              {SCHOOL_NAME} staff read-only view of students, fees, expenses, and outstanding balances.
            </p>
          </Link>
        </div>
      </div>
    </main>
  )
}
