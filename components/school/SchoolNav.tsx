"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { clearSchoolMirrorSession } from "@/lib/schoolAuth"
import { Home, Users, Receipt, Package, AlertTriangle, LogOut, Scale, Boxes, Warehouse } from "lucide-react"

const links = [
  { href: "/school", label: "Dashboard", icon: Home, exact: true },
  { href: "/school/students", label: "Students", icon: Users },
  { href: "/school/expenses", label: "Expenses", icon: Receipt },
  { href: "/school/extrabilling", label: "Extra Billing", icon: Package },
  { href: "/school/balancesheet", label: "Balance Sheet", icon: Scale },
  { href: "/school/inventory", label: "Inventory", icon: Boxes },
  { href: "/school/resources", label: "Resources", icon: Warehouse },
  { href: "/school/outstanding", label: "Outstanding", icon: AlertTriangle },
]

export function SchoolNav() {
  const pathname = usePathname()
  const router = useRouter()

  const logout = () => {
    clearSchoolMirrorSession()
    router.replace("/school/login")
  }

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {links.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-brand-600 text-white"
                    : "text-slate-600 hover:bg-brand-50 hover:text-brand-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            )
          })}
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="text-sm text-slate-500 hover:text-brand-600">
            Portals
          </Link>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
