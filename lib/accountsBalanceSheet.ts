import { BillingCycle, type AppSettings, type BillingCycleType, type Expense, type ExtraBillingPage, type Student } from "@/types/school"
import type { SaleRecord } from "@/types/inventory"

export interface BalanceSheetLine {
  label: string
  amount: number
}

export interface MonthlyBalanceSheet {
  year: number
  month: number
  monthName: string
  income: BalanceSheetLine[]
  totalIncome: number
  expenses: BalanceSheetLine[]
  totalExpenses: number
  netBalance: number
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

const SHORT_MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function getBalanceSheetMonthName(month: number): string {
  return MONTH_NAMES[month - 1] || "Unknown"
}

function getMonthName(month: number): string {
  return getBalanceSheetMonthName(month)
}

function getShortMonthName(month: number): string {
  return SHORT_MONTH_NAMES[month - 1] || "?"
}

function roundAmount(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function parsePaymentDate(dateStr?: string): Date | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return Number.isNaN(d.getTime()) ? null : d
}

function isInCalendarMonth(date: Date | null, year: number, month: number): boolean {
  if (!date) return false
  return date.getFullYear() === year && date.getMonth() + 1 === month
}

function sumTuitionCollections(
  students: Student[],
  year: number,
  month: number,
  billingCycle: BillingCycleType,
): number {
  let total = 0

  students.forEach((student) => {
    if (!Array.isArray(student.feePayments)) return

    student.feePayments.forEach((payment) => {
      if ((payment.amountPaid || 0) <= 0 || payment.isSkipped) return

      const paidDate = parsePaymentDate(payment.paidDate)
      if (paidDate) {
        if (isInCalendarMonth(paidDate, year, month)) {
          total += payment.amountPaid || 0
        }
        return
      }

      if (billingCycle === BillingCycle.MONTHLY && payment.period === month) {
        total += payment.amountPaid || 0
      }
    })
  })

  return roundAmount(total)
}

function sumTransportCollections(students: Student[], year: number, month: number): number {
  let total = 0

  students.forEach((student) => {
    if (!student.hasTransport || !Array.isArray(student.transportPayments)) return

    student.transportPayments.forEach((payment) => {
      if (payment.isSkipped || (payment.amountPaid || 0) <= 0) return

      const paidDate = parsePaymentDate(payment.paidDate)
      if (paidDate) {
        if (isInCalendarMonth(paidDate, year, month)) {
          total += payment.amountPaid || 0
        }
        return
      }

      if (payment.month === month) {
        total += payment.amountPaid || 0
      }
    })
  })

  return roundAmount(total)
}

function sumInventorySales(sales: SaleRecord[], year: number, month: number): number {
  let total = 0

  sales.forEach((sale) => {
    if (sale.status && sale.status !== "completed") return
    const soldDate = parsePaymentDate(sale.soldAt)
    if (!isInCalendarMonth(soldDate, year, month)) return
    total += sale.total || 0
  })

  return roundAmount(total)
}

function getExtraBillingByPage(
  pages: ExtraBillingPage[],
  year: number,
  month: number,
): BalanceSheetLine[] {
  const monthLabel = getMonthName(month)
  const lines: BalanceSheetLine[] = []

  pages.forEach((page) => {
    if (!page?.name) return
    let pageTotal = 0

    const entries = Array.isArray(page.entries) ? page.entries : []
    entries.forEach((entry) => {
      if (entry?.deleted) return
      const payments = Array.isArray(entry.payments) ? entry.payments : []
      payments.forEach((payment) => {
        const paymentDate = parsePaymentDate(payment?.date)
        if (!isInCalendarMonth(paymentDate, year, month)) return
        pageTotal += payment.amount || 0
      })
    })

    if (pageTotal > 0) {
      lines.push({
        label: `${page.name} (${monthLabel} Extra Billing)`,
        amount: roundAmount(pageTotal),
      })
    }
  })

  return lines.sort((a, b) => a.label.localeCompare(b.label))
}

function getExpensesForMonth(expenses: Expense[], year: number, month: number): BalanceSheetLine[] {
  const monthLabel = getMonthName(month)
  let total = 0

  expenses.forEach((expense) => {
    if (expense.isReversed || expense.reversed) return
    const expenseDate = parsePaymentDate(expense.date)
    if (!isInCalendarMonth(expenseDate, year, month)) return
    total += expense.amount || 0
  })

  return [
    {
      label: `Expenses (Month of ${monthLabel})`,
      amount: roundAmount(total),
    },
  ]
}

export function buildMonthlyBalanceSheet(
  year: number,
  month: number,
  students: Student[],
  settings: AppSettings,
  expenses: Expense[],
  sales: SaleRecord[],
  extraBillingPages: ExtraBillingPage[],
): MonthlyBalanceSheet {
  const monthName = getMonthName(month)
  const shortMonth = getShortMonthName(month)
  const billingCycle = settings.billingCycle || BillingCycle.MONTHLY

  const income: BalanceSheetLine[] = []

  const tuitionTotal = sumTuitionCollections(students, year, month, billingCycle)
  if (tuitionTotal > 0) {
    income.push({ label: `Tuition Fee (${shortMonth} Collections)`, amount: tuitionTotal })
  }

  const transportTotal = sumTransportCollections(students, year, month)
  if (transportTotal > 0) {
    income.push({ label: `Transport Fee (${shortMonth} Collections)`, amount: transportTotal })
  }

  const inventoryTotal = sumInventorySales(sales, year, month)
  if (inventoryTotal > 0) {
    income.push({ label: `Inventory (${shortMonth} Sales)`, amount: inventoryTotal })
  }

  income.push(...getExtraBillingByPage(extraBillingPages, year, month))

  const expenseLines = getExpensesForMonth(expenses, year, month)
  const totalIncome = roundAmount(income.reduce((sum, line) => sum + line.amount, 0))
  const totalExpenses = roundAmount(expenseLines.reduce((sum, line) => sum + line.amount, 0))

  return {
    year,
    month,
    monthName,
    income,
    totalIncome,
    expenses: expenseLines,
    totalExpenses,
    netBalance: roundAmount(totalIncome - totalExpenses),
  }
}

/** Sum of monthly balance-sheet income and expenses from January through `throughMonth` (1–12). */
export function buildYearToDateTotals(
  year: number,
  throughMonth: number,
  students: Student[],
  settings: AppSettings,
  expenses: Expense[],
  sales: SaleRecord[],
  extraBillingPages: ExtraBillingPage[],
): { totalIncome: number; totalExpenses: number; throughMonthName: string } {
  const lastMonth = Math.min(12, Math.max(1, throughMonth))
  let totalIncome = 0
  let totalExpenses = 0

  for (let month = 1; month <= lastMonth; month++) {
    const sheet = buildMonthlyBalanceSheet(
      year,
      month,
      students,
      settings,
      expenses,
      sales,
      extraBillingPages,
    )
    totalIncome += sheet.totalIncome
    totalExpenses += sheet.totalExpenses
  }

  return {
    totalIncome: roundAmount(totalIncome),
    totalExpenses: roundAmount(totalExpenses),
    throughMonthName: getBalanceSheetMonthName(lastMonth),
  }
}

export function getCurrentYearMonths(): { month: number; label: string }[] {
  const year = new Date().getFullYear()
  return Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    label: `${getShortMonthName(i + 1)} ${year}`,
  }))
}
