import type { AppSettings, Student } from "@/types/school"
import { BillingCycle, TERMS } from "@/types/school"
import { getStartOfMonth, getStartOfTerm } from "./dateUtils"

function parseLocalDate(dateStr?: string): Date | null {
  if (!dateStr?.trim()) return null
  const m = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(d.getTime()) ? null : d
}

/** First day of the student's admission month. */
export function getAdmissionPeriodStart(admissionDate: string | Date): Date {
  const d = typeof admissionDate === "string" ? new Date(admissionDate) : admissionDate
  if (Number.isNaN(d.getTime())) {
    const now = new Date()
    return getStartOfMonth(now.getFullYear(), now.getMonth() + 1)
  }
  return getStartOfMonth(d.getFullYear(), d.getMonth() + 1)
}

/** School-wide billing start from settings, snapped to month/term boundary. */
export function getSettingsBillingPeriodStart(settings: AppSettings): Date | null {
  if (!settings.startBillingDate?.trim()) return null
  const parsed = parseLocalDate(settings.startBillingDate)
  if (!parsed) return null
  if (settings.billingCycle === BillingCycle.MONTHLY) {
    return getStartOfMonth(parsed.getFullYear(), parsed.getMonth() + 1)
  }
  const month = parsed.getMonth() + 1
  const termPeriod = TERMS.find((t) => t.months.includes(month))?.period ?? 1
  return getStartOfTerm(parsed.getFullYear(), termPeriod)
}

/**
 * Effective billing start for a student:
 * max(admission month start, settings.startBillingDate) when settings date is set.
 */
export function getEffectiveBillingPeriodStart(student: Student, settings: AppSettings): Date {
  const admissionStart = getAdmissionPeriodStart(student.admissionDate)
  const settingsStart = getSettingsBillingPeriodStart(settings)
  if (!settingsStart) return admissionStart
  return admissionStart.getTime() >= settingsStart.getTime() ? admissionStart : settingsStart
}

/** Start of the outstanding/collections window for the current calendar year. */
export function getOutstandingWindowStart(
  student: Student,
  settings: AppSettings,
  currentYear: number,
): Date {
  const admissionDate = new Date(student.admissionDate)
  const effectiveStart = getEffectiveBillingPeriodStart(student, settings)

  if (admissionDate.getFullYear() > currentYear) {
    return effectiveStart
  }

  const jan1 = new Date(currentYear, 0, 1)
  return effectiveStart.getTime() > jan1.getTime() ? effectiveStart : jan1
}

export function isPeriodBeforeEffectiveBillingStart(
  periodStart: Date,
  student: Student,
  settings: AppSettings,
): boolean {
  const billingStart = getEffectiveBillingPeriodStart(student, settings)
  return periodStart.getTime() < billingStart.getTime()
}

export function isPeriodBeforeAdmission(periodStart: Date, student: Student): boolean {
  const admissionStart = getAdmissionPeriodStart(student.admissionDate)
  return periodStart.getTime() < admissionStart.getTime()
}

/** Period is due for billing: on/after effective start and not in the future. */
export function isBillablePeriod(
  periodStart: Date,
  student: Student,
  settings: AppSettings,
  asOf: Date = new Date(),
): boolean {
  if (periodStart.getTime() > asOf.getTime()) return false
  return !isPeriodBeforeEffectiveBillingStart(periodStart, student, settings)
}

/** Month number (1–12) for transport/fee windows in a given calendar year. */
export function getBillingWindowStartMonth(
  student: Student,
  settings: AppSettings,
  year: number,
): number {
  const billingStart = getEffectiveBillingPeriodStart(student, settings)
  if (billingStart.getFullYear() > year) return 13
  if (billingStart.getFullYear() < year) return 1
  return billingStart.getMonth() + 1
}

export type BillingPeriodUiStatus = "pre-admission" | "deferred" | "active"

export function classifyBillingPeriodForUi(
  periodStart: Date,
  student: Student,
  settings: AppSettings,
): BillingPeriodUiStatus {
  if (isPeriodBeforeAdmission(periodStart, student)) return "pre-admission"
  if (isPeriodBeforeEffectiveBillingStart(periodStart, student, settings)) return "deferred"
  return "active"
}

export function formatBillingStartSummary(settings: AppSettings): string {
  if (!settings.startBillingDate?.trim()) {
    return "Billing follows each student's admission date."
  }
  const start = getSettingsBillingPeriodStart(settings)
  if (!start) return "Billing follows each student's admission date."
  return `School billing starts ${start.toLocaleDateString()} (or admission date if later).`
}
