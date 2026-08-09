import { SessionProvider } from "next-auth/react";
import { AppShell } from "@/components/layout/app-shell";
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
      <AppShell clinicLogoUrl={clinicLogoUrl} clinicName={clinicName}>
        {children}
      </AppShell>
      <BugReporter />
    </SessionProvider>
  );
}
