"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { FileText, Loader2, Package } from "lucide-react"
import { GroceriesMirrorView } from "@/components/school/GroceriesMirrorView"
import {
  findGroceriesPage,
  getGroceriesData,
  isGroceriesPage,
  sumStandardExtraBillingCollected,
} from "@/lib/groceriesBilling"
import { getInitial, subscribe } from "@/lib/realtime"
import type { ExtraBillingPage } from "@/types/school"

export default function SchoolExtraBillingPage() {
  const [pages, setPages] = useState<ExtraBillingPage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getInitial<ExtraBillingPage>("extraBilling")
        setPages(data)
      } catch {
        setError("Failed to load extra billing pages.")
      } finally {
        setLoading(false)
      }
    }
    load()
    const unsub = subscribe<ExtraBillingPage>("extraBilling", setPages)
    return () => unsub()
  }, [])

  const groceriesPage = useMemo(() => findGroceriesPage(pages), [pages])
  const groceries = useMemo(() => getGroceriesData(groceriesPage), [groceriesPage])
  const standardPages = useMemo(() => pages.filter((page) => !isGroceriesPage(page)), [pages])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <p className="text-rose-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
        <Package className="h-5 w-5" />
        Extra Billing
      </h1>

      <GroceriesMirrorView groceries={groceries} compact />

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Billing pages</h2>
        {standardPages.map((page) => {
          const entries = (page.entries || []).filter((entry) => !entry.deleted)
          const collected = entries.reduce(
            (sum, entry) =>
              sum +
              (entry.payments || []).reduce(
                (paymentSum, payment) => paymentSum + (Number(payment.amount) || 0),
                0,
              ),
            0,
          )

          return (
            <div key={page.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="flex items-center gap-2 font-medium text-slate-900">
                    <FileText className="h-4 w-4 text-brand-600" />
                    {page.name}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {entries.length} entries · ${collected.toLocaleString(undefined, { minimumFractionDigits: 2 })} collected
                    {page.createdAt && (
                      <> · Created {format(new Date(page.createdAt), "MMM dd, yyyy")}</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )
        })}

        {standardPages.length === 0 && (
          <p className="text-sm text-slate-500">No standard extra billing pages synced yet.</p>
        )}

        {standardPages.length > 0 && (
          <p className="text-sm text-slate-500">
            Total collected across billing pages: $
            {sumStandardExtraBillingCollected(pages).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </p>
        )}
      </div>

      <p className="text-xs text-slate-500">
        Manage groceries and billing pages in the desktop app — this mirror updates automatically after sync.
        {" "}
        <Link href="/school/extrabilling/groceries" className="text-brand-600 hover:underline">
          Open groceries checklist
        </Link>
      </p>
    </div>
  )
}
