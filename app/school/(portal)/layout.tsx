import { FirebaseConnectionBanner } from "@/components/FirebaseConnectionBanner"
import { FirebaseProjectFooter } from "@/components/FirebaseProjectFooter"
import { MirrorBanner } from "@/components/school/MirrorBanner"
import { SchoolNav } from "@/components/school/SchoolNav"

export default function SchoolPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MirrorBanner />
      <SchoolNav />
      <FirebaseConnectionBanner />
      <main className="min-h-screen bg-slate-50">
        {children}
        <FirebaseProjectFooter />
      </main>
    </>
  )
}
