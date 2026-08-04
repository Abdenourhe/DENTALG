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
  createClinicSchema,
  updateClinicSchema,
  deleteClinicSchema,
  clinicRequestSchema,
  reviewClinicRequestSchema,
  updateFeaturesSchema,
} from "@/lib/validations/platform";
import { Role, RequestStatus, TicketStatus } from "@prisma/client";
import bcrypt from "bcrypt";

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
// Clinic management (CRUD)
// ===================================================================

export async function createClinic(data: unknown) {
  await requirePlatformAdmin();
  const parsed = createClinicSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  const existing = await prisma.clinic.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (existing) {
    return {
      ok: false,
      errors: { slug: ["Ce slug est déjà utilisé."] },
    } as const;
  }

  const clinic = await prisma.clinic.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      email: parsed.data.email,
      phone: parsed.data.phone || undefined,
      address: parsed.data.address || undefined,
      city: parsed.data.city || undefined,
      wilaya: parsed.data.wilaya || undefined,
      plan: parsed.data.plan,
      features: {},
    },
  });

  revalidatePath("/superadmin/clinics");
  return { ok: true, clinic } as const;
}

export async function updateClinic(data: unknown) {
  await requirePlatformAdmin();
  const parsed = updateClinicSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  const { clinicId, ...updateData } = parsed.data;
  const cleaned: Record<string, unknown> = {};
  if (updateData.name !== undefined) cleaned.name = updateData.name;
  if (updateData.email !== undefined) cleaned.email = updateData.email;
  if (updateData.phone !== undefined)
    cleaned.phone = updateData.phone || undefined;
  if (updateData.address !== undefined)
    cleaned.address = updateData.address || undefined;
  if (updateData.city !== undefined)
    cleaned.city = updateData.city || undefined;
  if (updateData.wilaya !== undefined)
    cleaned.wilaya = updateData.wilaya || undefined;
  if (updateData.plan !== undefined) cleaned.plan = updateData.plan;
  if (updateData.isActive !== undefined) cleaned.isActive = updateData.isActive;

  const clinic = await prisma.clinic.update({
    where: { id: clinicId },
    data: cleaned,
  });

  revalidatePath("/superadmin/clinics");
  revalidatePath(`/superadmin/clinics/${clinicId}`);
  return { ok: true, clinic } as const;
}

export async function deleteClinic(data: unknown) {
  await requirePlatformAdmin();
  const parsed = deleteClinicSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  await prisma.clinic.delete({ where: { id: parsed.data.clinicId } });

  revalidatePath("/superadmin/clinics");
  return { ok: true } as const;
}

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
// Clinic Requests
// ===================================================================

export async function listClinicRequests(status?: string) {
  await requirePlatformAdmin();
  return prisma.clinicRequest.findMany({
    where: status ? { status: status as RequestStatus } : undefined,
    orderBy: { createdAt: "desc" },
  });
}

export async function createClinicRequest(data: unknown) {
  const parsed = clinicRequestSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  const existingSlug = await prisma.clinic.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (existingSlug) {
    return {
      ok: false,
      errors: { slug: ["Ce slug est déjà utilisé."] },
    } as const;
  }

  const existingRequest = await prisma.clinicRequest.findFirst({
    where: { slug: parsed.data.slug, status: "PENDING" },
  });
  if (existingRequest) {
    return {
      ok: false,
      errors: { slug: ["Une demande est déjà en cours pour ce slug."] },
    } as const;
  }

  const passwordHash = await bcrypt.hash(parsed.data.ownerPassword, 12);

  const req = await prisma.clinicRequest.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      email: parsed.data.email,
      phone: parsed.data.phone || undefined,
      address: parsed.data.address || undefined,
      city: parsed.data.city || undefined,
      wilaya: parsed.data.wilaya || undefined,
      ownerFirstName: parsed.data.ownerFirstName,
      ownerLastName: parsed.data.ownerLastName,
      ownerEmail: parsed.data.ownerEmail,
      ownerPassword: passwordHash,
    },
  });

  return { ok: true, request: req } as const;
}

export async function reviewClinicRequest(data: unknown) {
  const admin = await requirePlatformAdmin();
  const parsed = reviewClinicRequestSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  const req = await prisma.clinicRequest.findUnique({
    where: { id: parsed.data.requestId },
  });
  if (!req) {
    return {
      ok: false,
      errors: { requestId: ["Demande introuvable."] },
    } as const;
  }

  if (parsed.data.status === "APPROVED") {
    // Create clinic
    const clinic = await prisma.clinic.create({
      data: {
        name: req.name,
        slug: req.slug,
        email: req.email,
        phone: req.phone,
        address: req.address,
        city: req.city,
        wilaya: req.wilaya,
        plan: "FREE",
        features: {},
      },
    });

    // Create owner user
    await prisma.user.create({
      data: {
        clinicId: clinic.id,
        email: req.ownerEmail,
        passwordHash: req.ownerPassword ?? "",
        firstName: req.ownerFirstName,
        lastName: req.ownerLastName,
        role: Role.OWNER,
      },
    });

    await prisma.clinicRequest.update({
      where: { id: parsed.data.requestId },
      data: {
        status: "APPROVED",
        reviewedById: admin.userId,
        reviewedAt: new Date(),
        notes: parsed.data.notes || undefined,
      },
    });
  } else {
    await prisma.clinicRequest.update({
      where: { id: parsed.data.requestId },
      data: {
        status: "REJECTED",
        reviewedById: admin.userId,
        reviewedAt: new Date(),
        notes: parsed.data.notes || undefined,
      },
    });
  }

  revalidatePath("/superadmin/clinic-requests");
  return { ok: true } as const;
}

// ===================================================================
// Feature flags
// ===================================================================

export async function updateClinicFeatures(data: unknown) {
  const parsed = updateFeaturesSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  const featuresJson: Record<string, boolean> = parsed.data.features;
  await prisma.clinic.update({
    where: { id: parsed.data.clinicId },
    data: { features: featuresJson },
  });

  revalidatePath("/settings/features");
  return { ok: true } as const;
}

// ===================================================================
// Stats for superadmin dashboard
// ===================================================================

export async function getSuperAdminStats() {
  await requirePlatformAdmin();
  const [
    openTickets,
    pendingRequests,
    totalMessages,
    recentMessages,
    pendingClinicRequests,
  ] = await Promise.all([
    prisma.supportTicket.count({ where: { status: "OPEN" } }),
    prisma.userRequest.count({ where: { status: "PENDING" } }),
    prisma.platformMessage.count(),
    prisma.platformMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.clinicRequest.count({ where: { status: "PENDING" } }),
  ]);

  return {
    openTickets,
    pendingRequests,
    totalMessages,
    recentMessages,
    pendingClinicRequests,
  };
}
