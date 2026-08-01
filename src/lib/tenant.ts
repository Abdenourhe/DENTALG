import { auth } from "../../auth";
import { notFound } from "next/navigation";

export interface ClinicContext {
  clinicId: string;
  userId: string;
}

export class TenantError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TenantError";
  }
}

export async function getClinicContext(): Promise<ClinicContext> {
  const session = await auth();
  const user = session?.user;

  if (!user || user.role === "PLATFORM_ADMIN" || !user.clinicId) {
    throw new TenantError("Contexte cabinet requis.");
  }

  return { clinicId: user.clinicId, userId: user.id };
}

export function withClinic<T extends Record<string, unknown>>(
  ctx: ClinicContext,
  payload: T
): T & { clinicId: string } {
  return { ...payload, clinicId: ctx.clinicId };
}

export async function requireClinicContext(): Promise<ClinicContext> {
  try {
    return await getClinicContext();
  } catch {
    notFound();
  }
}
