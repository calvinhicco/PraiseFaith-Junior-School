export type BillingCycleType = "monthly" | "termly"

export const BillingCycle = {
  MONTHLY: "monthly" as BillingCycleType,
  TERMLY: "termly" as BillingCycleType,
}

export const TERMS = [
  { name: "Term 1", months: [1, 2, 3, 4], period: 1 },
  { name: "Term 2", months: [5, 6, 7, 8], period: 2 },
  { name: "Term 3", months: [9, 10, 11, 12], period: 3 },
]

export interface FeePayment {
  period: number
  amountDue: number
  amountPaid: number
  paid: boolean
  dueDate: string
  paidDate?: string
  isTransportWaived: boolean
  isSkipped?: boolean
  outstandingAmount: number
}

export interface TransportPayment {
  month: number
  monthName: string
  amountDue: number
  amountPaid: number
  paid: boolean
  dueDate: string
  paidDate?: string
  isWaived: boolean
  outstandingAmount: number
  isActive: boolean
  isSkipped: boolean
}

export interface Student {
  id: string
  fullName: string
  className: string
  classGroup: string
  parentContact: string
  address?: string
  admissionDate: string
  academicYear?: string
  hasTransport: boolean
  transportFee: number
  transportActivationDate?: string
  feePayments: FeePayment[]
  transportPayments?: TransportPayment[]
  totalPaid?: number
  totalOwed?: number
}

export interface AppSettings {
  schoolName?: string
  currency?: string
  billingCycle: BillingCycleType
  paymentDueDate?: number
  transportDueDate?: number
  /** School-wide billing start (YYYY-MM-DD). Billing uses max(admission, this date). */
  startBillingDate?: string
}

export interface Expense {
  id: string
  description?: string
  purpose?: string
  amount: number
  date: string
  category?: string
  isReversed?: boolean
  reversed?: boolean
}

export interface ExtraBillingPayment {
  amount: number
  date?: string
}

export interface ExtraBillingEntry {
  id?: string
  studentName?: string
  purpose?: string
  deleted?: boolean
  payments?: ExtraBillingPayment[]
}

export type GroceriesPeriodType = "month" | "term"

export interface GroceryRequirementItem {
  id: string
  name: string
  unit: string
  qtyRequired: number
  consumableId?: string
}

export interface GroceryStudentChecklist {
  studentId: string
  studentName: string
  className: string
  brought: Record<string, boolean>
}

export interface GroceriesPageData {
  periodType: GroceriesPeriodType
  periodLabel: string
  periodYear: number
  periodValue: number
  requirements: GroceryRequirementItem[]
  checklists: GroceryStudentChecklist[]
}

export interface ExtraBillingPage {
  id: string
  name: string
  pageKind?: "standard" | "groceries"
  entries?: ExtraBillingEntry[]
  groceries?: GroceriesPageData
  createdAt?: string
}

export interface OutstandingStudent {
  id: string
  fullName: string
  className?: string
  parentContact: string
  classGroup: string
  admissionDate: string
  hasTransport: boolean
  transportFee: number
  outstandingAmount: number
  lastUpdated?: string
}
