"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { NotificationBell } from "./notifications";

interface HeaderProps {
  clinicName?: string | null;
  clinicLogoUrl?: string | null;
}

function getInitials(name?: string | null) {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Header({ clinicName, clinicLogoUrl }: HeaderProps) {
  const { data: session } = useSession();

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 px-6 backdrop-blur-md"
    >
      <div className="flex items-center gap-3">
        {clinicLogoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={clinicLogoUrl}
            alt="Logo cabinet"
            className="hidden h-8 w-auto rounded-md object-contain sm:block"
          />
        )}
        <h1 className="text-lg font-semibold tracking-tight text-slate-900">
          {clinicName ?? session?.user?.name ?? "Cabinet"}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <NotificationBell />

        {/* User profile */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-900">
              {session?.user?.name ?? "Utilisateur"}
            </p>
            <p className="text-xs text-slate-500">{session?.user?.email}</p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 ring-2 ring-primary-200">
            {getInitials(session?.user?.name)}
          </div>

          <span className="hidden rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary-700 sm:inline-block">
            {session?.user?.role}
          </span>
        </div>
      </div>
    </motion.header>
  );
}
