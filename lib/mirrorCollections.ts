export const MIRROR_COLLECTIONS = [
  "students",
  "expenses",
  "extraBilling",
  "outstandingStudents",
  "inventories",
  "sales",
  "assets",
  "consumables",
  "resourceIssues",
  "staff",
  "staffLogs",
  "transferredStudents",
  "pendingPromoted",
] as const

export type MirrorCollection = (typeof MIRROR_COLLECTIONS)[number]

export function isMirrorCollection(name: string): name is MirrorCollection {
  return (MIRROR_COLLECTIONS as readonly string[]).includes(name)
}
