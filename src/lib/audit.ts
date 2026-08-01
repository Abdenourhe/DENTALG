import { prisma } from "./prisma";
import { AuditAction, Prisma } from "@prisma/client";

export interface AuditLogInput {
  action: AuditAction;
  entityType: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
  clinicId?: string | null;
  userId?: string | null;
  ip?: string;
  userAgent?: string;
}

export async function logAudit(input: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: input.metadata ?? Prisma.JsonNull,
        clinicId: input.clinicId,
        userId: input.userId,
        ip: input.ip,
        userAgent: input.userAgent,
      },
    });
  } catch {
    // Silently fail — audit logging must never break the business flow.
    // In production, consider sending to a fallback logger (Sentry, etc.).
  }
}
