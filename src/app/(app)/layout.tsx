import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BugReporter } from "@/components/bug-reporter";
import { prisma } from "@/lib/prisma";
import { getClinicContext } from "@/lib/tenant";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let clinicLogoUrl: string | null = null;
  let clinicName: string | null = null;

  try {
    const ctx = await getClinicContext();
    const clinic = await prisma.clinic.findUnique({
      where: { id: ctx.clinicId },
      select: { logoUrl: true, name: true },
    });
    clinicLogoUrl = clinic?.logoUrl ?? null;
    clinicName = clinic?.name ?? null;
  } catch {
    // PLATFORM_ADMIN ou pas de contexte : on laisse le logo DENTALG par défaut
  }

  return (
    <SessionProvider>
      <div className="flex h-screen">
        <Sidebar clinicLogoUrl={clinicLogoUrl} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header clinicName={clinicName} clinicLogoUrl={clinicLogoUrl} />
          <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
            {children}
          </main>
        </div>
      </div>
      <BugReporter />
    </SessionProvider>
  );
}
