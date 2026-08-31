"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Users } from "lucide-react"
import { getInitial, subscribe, subscribeAppSettings } from "@/lib/realtime"
import { buildYearToDateTotals } from "@/lib/accountsBalanceSheet"
import { formatMoney } from "@/lib/calculations"
import type { AppSettings, Expense, ExtraBillingPage, Student } from "@/types/school"
import type { SaleRecord } from "@/types/inventory"

const DEFAULT_SETTINGS: AppSettings = { billingCycle: "monthly" }

export function DashboardTotals() {
  const [students, setStudents] = useState<Student[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [sales, setSales] = useState<SaleRecord[]>([])
  const [extraBilling, setExtraBilling] = useState<ExtraBillingPage[]>([])
  const [totalOutstanding, setTotalOutstanding] = useState(0)
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<AppSettings | null>(null)

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  useEffect(() => {
    const load = async () => {
      const [studentDocs, expenseDocs, saleDocs, extraBillingDocs, outstanding] = await Promise.all([
        getInitial<Student>("students"),
        getInitial<Expense>("expenses"),
        getInitial<SaleRecord>("sales"),
        getInitial<ExtraBillingPage>("extraBilling"),
        getInitial<{ outstandingAmount: number }>("outstandingStudents"),
      ])

      setStudents(studentDocs)
      setExpenses(expenseDocs)
      setSales(saleDocs)
      setExtraBilling(extraBillingDocs)
      setTotalOutstanding(
        outstanding.reduce((sum, s) => sum + (Number(s.outstandingAmount) || 0), 0),
      )
      setLoading(false)
    }

    load()

    const unsubs = [
      subscribe<Student>("students", setStudents),
      subscribe<Expense>("expenses", setExpenses),
      subscribe<SaleRecord>("sales", setSales),
      subscribe<ExtraBillingPage>("extraBilling", setExtraBilling),
      subscribe<{ outstandingAmount: number }>("outstandingStudents", (docs) => {
        setTotalOutstanding(
          docs.reduce((sum, s) => sum + (Number(s.outstandingAmount) || 0), 0),
        )
      }),
      subscribeAppSettings<AppSettings>(setSettings),
    ]

    return () => unsubs.forEach((u) => u())
  }, [])

  const ytd = useMemo(
    () =>
      buildYearToDateTotals(
        currentYear,
        currentMonth,
        students,
        settings || DEFAULT_SETTINGS,
        expenses,
        sales,
        extraBilling,
      ),
    [currentYear, currentMonth, students, settings, expenses, sales, extraBilling],
  )

  const currency = settings?.currency || "$"
  const rangeLabel = `January to ${ytd.throughMonthName}`

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
      value: String(students.length),
      className: "bg-brand-gradient text-white",
      icon: Users,
    },
    {
      label: `Total Expenses (${rangeLabel})`,
      value: formatMoney(ytd.totalExpenses, currency),
      className: "bg-gradient-to-br from-rose-500 to-rose-600 text-white",
    },
    {
      label: `Total Income (${rangeLabel})`,
      value: formatMoney(ytd.totalIncome, currency),
      className: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white",
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
            <span className="pr-2 leading-snug">{label}</span>
            {Icon && <Icon className="h-4 w-4 shrink-0 opacity-80" />}
          </div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
      ))}
    </div>
  )
}
