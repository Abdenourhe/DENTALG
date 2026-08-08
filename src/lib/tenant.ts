import { auth } from "@/auth";
import { notFound } from "next/navigation";

export interface ClinicContext {
  userId: string;
  clinicId: string;
  role: string;
}

export class TenantError extends Error {
  constructor(message = "Contexte cabinet manquant.") {
    super(message);
    this.name = "TenantError";
  }
}

export async function getClinicContext(): Promise<ClinicContext | null> {
  const session = await auth();
  if (!session?.user?.id || !session.user.clinicId || !session.user.role) {
    return null;
  }
  return {
    userId: session.user.id,
    clinicId: session.user.clinicId,
    role: session.user.role,
  };
}

export async function requireClinicContext(): Promise<ClinicContext> {
  const ctx = await getClinicContext();
  if (!ctx) {
    notFound();
  }
  return ctx;
}

export function withClinic<T extends Record<string, unknown>>(
  ctx: ClinicContext,
  data: T,
): T & { clinicId: string } {
  return { ...data, clinicId: ctx.clinicId };
}

export function withClinicWhere<T extends Record<string, unknown>>(
  ctx: ClinicContext,
  where: T,
): T & { clinicId: string; deletedAt: null } {
  return { ...where, clinicId: ctx.clinicId, deletedAt: null };
}
