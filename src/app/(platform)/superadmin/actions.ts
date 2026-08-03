"use server";

import { revalidatePath } from "next/cache";
import { requirePlatformAdmin } from "@/lib/platform-auth";
import { prisma } from "@/lib/prisma";
import {
  platformMessageSchema,
  ticketReplySchema,
  updateTicketStatusSchema,
  reviewUserRequestSchema,
  toggleClinicStatusSchema,
} from "@/lib/validations/platform";
import { Role, RequestStatus, TicketStatus } from "@prisma/client";

// ===================================================================
// Platform Messages (Admin → Cabinets)
// ===================================================================

export async function listPlatformMessages() {
  await requirePlatformAdmin();
  return prisma.platformMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function createPlatformMessage(data: unknown) {
  const admin = await requirePlatformAdmin();
  const parsed = platformMessageSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  const msg = await prisma.platformMessage.create({
    data: {
      senderId: admin.userId,
      title: parsed.data.title,
      content: parsed.data.content,
      type: parsed.data.type,
      targetRole: parsed.data.targetRole || undefined,
      targetClinicId: parsed.data.targetClinicId || undefined,
      isBroadcast: parsed.data.isBroadcast,
      readBy: [],
    },
  });

  revalidatePath("/superadmin/messages");
  return { ok: true, message: msg } as const;
}

// ===================================================================
// Support Tickets (Users → Admin)
// ===================================================================

export async function listSupportTickets(status?: string) {
  await requirePlatformAdmin();
  return prisma.supportTicket.findMany({
    where: status ? { status: status as TicketStatus } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      clinic: { select: { name: true, slug: true } },
      user: {
        select: { firstName: true, lastName: true, email: true, role: true },
      },
      _count: { select: { messages: true } },
    },
  });
}

export async function getSupportTicket(id: string) {
  await requirePlatformAdmin();
  return prisma.supportTicket.findUnique({
    where: { id },
    include: {
      clinic: { select: { name: true, slug: true, email: true } },
      user: {
        select: { firstName: true, lastName: true, email: true, role: true },
      },
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function replyToTicket(data: unknown) {
  const admin = await requirePlatformAdmin();
  const parsed = ticketReplySchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  const reply = await prisma.ticketMessage.create({
    data: {
      ticketId: parsed.data.ticketId,
      authorId: admin.userId,
      content: parsed.data.content,
      isAdmin: true,
    },
  });

  // Update ticket status to IN_PROGRESS if it was OPEN
  await prisma.supportTicket.update({
    where: { id: parsed.data.ticketId },
    data: { status: "IN_PROGRESS", updatedAt: new Date() },
  });

  revalidatePath("/superadmin/tickets");
  revalidatePath(`/superadmin/tickets/${parsed.data.ticketId}`);
  return { ok: true, reply } as const;
}

export async function updateTicketStatus(data: unknown) {
  await requirePlatformAdmin();
  const parsed = updateTicketStatusSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  await prisma.supportTicket.update({
    where: { id: parsed.data.ticketId },
    data: { status: parsed.data.status as TicketStatus, updatedAt: new Date() },
  });

  revalidatePath("/superadmin/tickets");
  revalidatePath(`/superadmin/tickets/${parsed.data.ticketId}`);
  return { ok: true } as const;
}

// ===================================================================
// User Requests (Profile creation approvals)
// ===================================================================

export async function listUserRequests(status?: string) {
  await requirePlatformAdmin();
  return prisma.userRequest.findMany({
    where: status ? { status: status as RequestStatus } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      clinic: { select: { name: true, slug: true } },
      requester: { select: { firstName: true, lastName: true, email: true } },
    },
  });
}

export async function reviewUserRequest(data: unknown) {
  const admin = await requirePlatformAdmin();
  const parsed = reviewUserRequestSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  const req = await prisma.userRequest.update({
    where: { id: parsed.data.requestId },
    data: {
      status: parsed.data.status as RequestStatus,
      reviewedById: admin.userId,
      reviewedAt: new Date(),
      notes: parsed.data.notes || undefined,
    },
  });

  revalidatePath("/superadmin/requests");
  return { ok: true, request: req } as const;
}

// ===================================================================
// Clinic management
// ===================================================================

export async function toggleClinicStatus(data: unknown) {
  await requirePlatformAdmin();
  const parsed = toggleClinicStatusSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id: parsed.data.clinicId },
  });
  if (!clinic) {
    return {
      ok: false,
      errors: { clinicId: ["Cabinet introuvable."] },
    } as const;
  }

  await prisma.clinic.update({
    where: { id: parsed.data.clinicId },
    data: { isActive: !clinic.isActive },
  });

  revalidatePath("/superadmin/clinics");
  return { ok: true } as const;
}

// ===================================================================
// Stats for superadmin dashboard
// ===================================================================

export async function getSuperAdminStats() {
  await requirePlatformAdmin();
  const [openTickets, pendingRequests, totalMessages, recentMessages] =
    await Promise.all([
      prisma.supportTicket.count({ where: { status: "OPEN" } }),
      prisma.userRequest.count({ where: { status: "PENDING" } }),
      prisma.platformMessage.count(),
      prisma.platformMessage.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  return { openTickets, pendingRequests, totalMessages, recentMessages };
}
