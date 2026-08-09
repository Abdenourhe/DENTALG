"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface AppShellProps {
  children: React.ReactNode;
  clinicLogoUrl?: string | null;
  clinicName?: string | null;
}

export function AppShell({
  children,
  clinicLogoUrl,
  clinicName,
}: AppShellProps) {
  const pathname = usePathname();
  const isFullscreen = pathname === "/waiting-room/display";

  if (isFullscreen) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-slate-950">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar clinicLogoUrl={clinicLogoUrl} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header clinicName={clinicName} clinicLogoUrl={clinicLogoUrl} />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
