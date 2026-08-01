"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function SidebarLogout() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/superadmin/login" })}
      className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
    >
      <LogOut className="h-5 w-5" />
      Déconnexion
    </button>
  );
}
