import { requirePlatformAdmin } from "@/lib/platform-auth";
import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  Shield,
} from "lucide-react";
import { SidebarLogout } from "@/components/sidebar-logout";

const navItems = [
  { href: "/superadmin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/superadmin/clinics", label: "Cabinets", icon: Building2 },
];

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requirePlatformAdmin();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-72 flex-col bg-slate-900 text-slate-100">
        <div className="flex h-20 items-center gap-3 border-b border-slate-800 px-8">
          <Shield className="h-7 w-7 text-blue-400" />
          <div>
            <Link href="/superadmin" className="text-lg font-bold tracking-tight">
              DENTALG Admin
            </Link>
            <p className="text-xs text-slate-400">Plateforme</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <Icon className="h-5 w-5 text-slate-400 group-hover:text-white" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="mb-4 px-4 py-2">
            <p className="text-xs font-medium text-slate-400">Connecté</p>
            <p className="truncate text-sm font-medium text-white">{admin.email}</p>
          </div>
          <SidebarLogout />
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl p-8">{children}</div>
      </main>
    </div>
  );
}
