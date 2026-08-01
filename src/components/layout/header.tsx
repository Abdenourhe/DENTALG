"use client";

import { useSession } from "next-auth/react";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-slate-900">
        {session?.user?.name ?? "Cabinet"}
      </h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600">{session?.user?.email}</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 uppercase">
          {session?.user?.role}
        </span>
      </div>
    </header>
  );
}
