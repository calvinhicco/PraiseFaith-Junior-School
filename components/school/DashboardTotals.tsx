"use client"

import { useEffect, useState } from "react"
import { Loader2, Users } from "lucide-react"
import { getInitial, subscribe, subscribeAppSettings } from "@/lib/realtime"
import { formatMoney } from "@/lib/calculations"
import type { AppSettings } from "@/types/school"

export function DashboardTotals() {
  const [totalStudents, setTotalStudents] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [totalExtraBilling, setTotalExtraBilling] = useState(0)
  const [totalOutstanding, setTotalOutstanding] = useState(0)
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<AppSettings | null>(null)

  useEffect(() => {
    const load = async () => {
      const [students, expenses, extraBilling, outstanding] = await Promise.all([
        getInitial<{ id: string }>("students"),
        getInitial<{ amount: number; isReversed?: boolean; reversed?: boolean }>("expenses"),
        getInitial<{ amount: number }>("extraBilling"),
        getInitial<{ outstandingAmount: number }>("outstandingStudents"),
      ])

      setTotalStudents(students.length)
      setTotalExpenses(
        expenses.reduce((sum, e) => {
          if (e.isReversed || e.reversed) return sum
          return sum + (Number(e.amount) || 0)
        }, 0),
      )
      setTotalExtraBilling(
        extraBilling.reduce((sum, b) => sum + (Number(b.amount) || 0), 0),
      )
      setTotalOutstanding(
        outstanding.reduce((sum, s) => sum + (Number(s.outstandingAmount) || 0), 0),
      )
      setLoading(false)
    }

    load()

    const unsubs = [
      subscribe<{ id: string }>("students", (docs) => setTotalStudents(docs.length)),
      subscribe<{ amount: number; isReversed?: boolean; reversed?: boolean }>("expenses", (docs) => {
        setTotalExpenses(
          docs.reduce((sum, e) => {
            if (e.isReversed || e.reversed) return sum
            return sum + (Number(e.amount) || 0)
          }, 0),
        )
      }),
      subscribe<{ amount: number }>("extraBilling", (docs) => {
        setTotalExtraBilling(
          docs.reduce((sum, b) => sum + (Number(b.amount) || 0), 0),
        )
      }),
      subscribe<{ outstandingAmount: number }>("outstandingStudents", (docs) => {
        setTotalOutstanding(
          docs.reduce((sum, s) => sum + (Number(s.outstandingAmount) || 0), 0),
        )
      }),
      subscribeAppSettings<AppSettings>(setSettings),
    ]

    return () => unsubs.forEach((u) => u())
  }, [])

  const currency = settings?.currency || "$"

  if (loading) {
    return (
      <div className="flex h-24 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
      </div>
    )
  }

  const cards = [
    {
      label: "Total Students",
      value: String(totalStudents),
      className: "bg-brand-gradient text-white",
      icon: Users,
    },
    {
      label: "Total Expenses",
      value: formatMoney(totalExpenses, currency),
      className: "bg-gradient-to-br from-rose-500 to-rose-600 text-white",
    },
    {
      label: "Extra Billing",
      value: formatMoney(totalExtraBilling, currency),
      className: "bg-gradient-to-br from-violet-400 to-violet-500 text-white",
    },
    {
      label: "Outstanding",
      value: formatMoney(totalOutstanding, currency),
      className: "bg-gradient-to-br from-amber-500 to-amber-600 text-white",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ label, value, className, icon: Icon }) => (
        <div key={label} className={`rounded-xl p-5 shadow-lg ${className}`}>
          <div className="mb-2 flex items-center justify-between text-sm font-medium opacity-90">
            {label}
            {Icon && <Icon className="h-4 w-4 opacity-80" />}
          </div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
      ))}
    </div>
  )
}
