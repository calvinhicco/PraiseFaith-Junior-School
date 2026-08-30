import type { ExtraBillingPage, GroceriesPageData } from "@/types/school"

export const GROCERIES_PAGE_NAME = "Groceries"

export function isGroceriesPage(page: Pick<ExtraBillingPage, "pageKind" | "name">): boolean {
  return page.pageKind === "groceries" || page.name === GROCERIES_PAGE_NAME
}

export function findGroceriesPage(pages: ExtraBillingPage[]): ExtraBillingPage | null {
  return pages.find(isGroceriesPage) || null
}

export function getGroceriesData(page: ExtraBillingPage | null): GroceriesPageData | null {
  if (!page || !isGroceriesPage(page)) return null
  return page.groceries || null
}

export function getGroceriesCompletionSummary(data: GroceriesPageData | null) {
  if (!data) {
    return { reqCount: 0, studentCount: 0, totalChecks: 0, completedChecks: 0 }
  }

  const reqCount = data.requirements.length
  const studentCount = data.checklists.length
  const totalChecks = reqCount * studentCount
  const completedChecks = data.checklists.reduce((sum, row) => {
    return (
      sum +
      data.requirements.reduce((inner, req) => inner + (row.brought[req.id] ? 1 : 0), 0)
    )
  }, 0)

  return { reqCount, studentCount, totalChecks, completedChecks }
}

export function sumStandardExtraBillingCollected(pages: ExtraBillingPage[]): number {
  return pages
    .filter((page) => !isGroceriesPage(page))
    .reduce((sum, page) => {
      return (
        sum +
        (page.entries || [])
          .filter((entry) => !entry.deleted)
          .reduce(
            (entrySum, entry) =>
              entrySum +
              (entry.payments || []).reduce(
                (paymentSum, payment) => paymentSum + (Number(payment.amount) || 0),
                0,
              ),
            0,
          )
      )
    }, 0)
}
