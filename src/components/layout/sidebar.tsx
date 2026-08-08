"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CreditCard,
  Stethoscope,
  Briefcase,
  LogOut,
  UserCog,
  FlaskConical,
  FileText,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/appointments", label: "Rendez-vous", icon: CalendarDays },
  { href: "/procedures", label: "Actes", icon: Stethoscope },
  { href: "/billing", label: "Facturation", icon: CreditCard },
  { href: "/prescriptions", label: "Ordonnances", icon: FileText },
  { href: "/lab", label: "Labo", icon: FlaskConical },
  { href: "/carrieres/manage", label: "Carrière", icon: Briefcase },
  { href: "/users", label: "Utilisateurs", icon: UserCog },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200/80 bg-white">
      <div className="flex h-16 items-center justify-center border-b border-slate-200/80 px-4">
        <Link href="/dashboard" className="text-xl font-bold text-primary">
          DENTALG
        </Link>
      </div>

      <nav className="flex-1 px-3 py-5">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary-50 text-primary-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 ${
                      isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-slate-200/80 p-3">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
