"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { GroceriesMirrorView } from "@/components/school/GroceriesMirrorView"
import { findGroceriesPage, getGroceriesData } from "@/lib/groceriesBilling"
import { getInitial, subscribe } from "@/lib/realtime"
import type { ExtraBillingPage } from "@/types/school"

export default function SchoolGroceriesPage() {
  const [pages, setPages] = useState<ExtraBillingPage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const data = await getInitial<ExtraBillingPage>("extraBilling")
      setPages(data)
      setLoading(false)
    }
    load()
    const unsub = subscribe<ExtraBillingPage>("extraBilling", setPages)
    return () => unsub()
  }, [])

  const groceries = useMemo(() => getGroceriesData(findGroceriesPage(pages)), [pages])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    )
  }

  return <GroceriesMirrorView groceries={groceries} showBackLink />
}
