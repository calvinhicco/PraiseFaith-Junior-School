"use client"

import Link from "next/link"
import { ArrowLeft, Check, Package } from "lucide-react"
import {
  getGroceriesCompletionSummary,
  GROCERIES_PAGE_NAME,
} from "@/lib/groceriesBilling"
import type { GroceriesPageData } from "@/types/school"

interface GroceriesMirrorViewProps {
  groceries: GroceriesPageData | null
  compact?: boolean
  showBackLink?: boolean
}

export function GroceriesMirrorView({
  groceries,
  compact = false,
  showBackLink = false,
}: GroceriesMirrorViewProps) {
  const summary = getGroceriesCompletionSummary(groceries)
  const requirements = groceries?.requirements || []
  const checklists = groceries?.checklists || []

  if (compact) {
    return (
      <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-violet-900">
              <Package className="h-5 w-5" />
              {GROCERIES_PAGE_NAME}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {groceries?.periodLabel || "No period set yet"} · Read-only mirror from desktop sync
            </p>
          </div>
          <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-medium text-white">
            {summary.completedChecks}/{summary.totalChecks} ticks
          </span>
        </div>
        <div className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
          <p>Items listed: {summary.reqCount}</p>
          <p>Students: {summary.studentCount}</p>
          <p>Checklist progress: {summary.totalChecks > 0 ? `${Math.round((summary.completedChecks / summary.totalChecks) * 100)}%` : "—"}</p>
        </div>
        <Link
          href="/school/extrabilling/groceries"
          className="mt-4 inline-flex text-sm font-medium text-violet-700 hover:text-violet-900 hover:underline"
        >
          View full groceries checklist →
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {showBackLink && (
            <Link
              href="/school/extrabilling"
              className="mb-3 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-brand-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Extra Billing
            </Link>
          )}
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
            <Package className="h-5 w-5 text-violet-600" />
            {GROCERIES_PAGE_NAME}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {groceries?.periodLabel || "No period synced yet"} · Updates live when the desktop app syncs
          </p>
        </div>
        <span className="rounded-full bg-violet-600 px-3 py-1 text-sm font-medium text-white">
          {summary.completedChecks}/{summary.totalChecks} ticks
        </span>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Grocery requirements</h2>
        {requirements.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No grocery items listed yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {requirements.map((req, index) => (
              <li
                key={req.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
              >
                <span className="font-medium text-slate-900">
                  {index + 1}. {req.name}
                </span>
                <span className="text-slate-600">
                  {req.qtyRequired} {req.unit || "pack"} per student
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Student checklist</h2>
        {requirements.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Add grocery requirements in the desktop app first.</p>
        ) : checklists.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No student checklist synced yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-[640px] w-full border-collapse text-sm">
              <thead>
                <tr className="bg-violet-50">
                  <th className="sticky left-0 border border-slate-200 bg-violet-50 p-2 text-left">Student</th>
                  <th className="border border-slate-200 p-2 text-left">Class</th>
                  {requirements.map((req) => (
                    <th key={req.id} className="border border-slate-200 p-2 text-center whitespace-nowrap">
                      {req.name}
                      <div className="text-xs font-normal text-slate-500">×{req.qtyRequired}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {checklists.map((row) => (
                  <tr key={row.studentId} className="hover:bg-slate-50">
                    <td className="sticky left-0 border border-slate-200 bg-white p-2 font-medium">
                      {row.studentName}
                    </td>
                    <td className="border border-slate-200 p-2">{row.className || "—"}</td>
                    {requirements.map((req) => (
                      <td key={req.id} className="border border-slate-200 p-2 text-center">
                        {row.brought[req.id] ? (
                          <Check className="mx-auto h-4 w-4 text-emerald-600" aria-label="Brought" />
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
