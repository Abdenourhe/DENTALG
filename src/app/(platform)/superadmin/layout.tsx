import { requirePlatformAdmin } from "@/lib/platform-auth";
import Link from "next/link";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePlatformAdmin();

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-white">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/superadmin" className="text-xl font-bold">
            DENTALG Admin
          </Link>
        </div>
        <nav className="space-y-1 px-3 py-4">
          <Link
            href="/superadmin"
            className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100"
          >
            Tableau de bord
          </Link>
          <Link
            href="/superadmin/clinics"
            className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100"
          >
            Cabinets
          </Link>
        </nav>
      </aside>
      <main className="flex-1 bg-slate-50 p-6">{children}</main>
    </div>
  );
}
