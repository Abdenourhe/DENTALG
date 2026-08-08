import { prisma } from "./prisma";
import { AuditAction, Prisma } from "@prisma/client";

interface LogAuditInput {
  action: AuditAction;
  entityType: string;
  entityId?: string;
  clinicId?: string | null;
  userId?: string | null;
  metadata?: Prisma.InputJsonValue;
  ip?: string;
  userAgent?: string;
}

export async function logAudit(input: LogAuditInput) {
  try {
    await prisma.auditLog.create({
      data: {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        clinicId: input.clinicId,
        userId: input.userId,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
        ip: input.ip,
        userAgent: input.userAgent,
      },
    });
  } catch {
    // Audit failure must not break user-facing actions.
    // In production, send to a fallback logger.
  }
}
