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
  updateClinicRequestSchema,
  reviewClinicRequestSchema,
  updateFeaturesSchema,
  toggleUserStatusSchema,
  updateUserRoleSchema,
  sendPaymentRequestSchema,
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

export async function createPlatformMessageFromForm(formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  await createPlatformMessage({
    ...data,
    isBroadcast: data.isBroadcast === "on",
  });
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

export async function replyToTicketFromForm(formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  await replyToTicket(data);
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

export async function updateTicketStatusFromForm(formData: FormData) {
  const ticketId = formData.get("ticketId") as string;
  const status = formData.get("status") as TicketStatus;
  await updateTicketStatus({ ticketId, status });
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

export async function reviewUserRequestFromForm(formData: FormData) {
  const requestId = formData.get("requestId") as string;
  const status = formData.get("status") as RequestStatus;
  await reviewUserRequest({ requestId, status });
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

export async function toggleClinicStatusFromForm(formData: FormData) {
  const clinicId = formData.get("clinicId") as string;
  await toggleClinicStatus({ clinicId });
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
      doctorCount: parsed.data.doctorCount || undefined,
      assistantCount: parsed.data.assistantCount || undefined,
      secretaryCount: parsed.data.secretaryCount || undefined,
      specialty: parsed.data.specialty || undefined,
      equipmentNeeds: parsed.data.equipmentNeeds || undefined,
      requestedPlan: parsed.data.requestedPlan,
    },
  });

  return { ok: true, request: req } as const;
}

export async function updateClinicRequest(data: unknown) {
  await requirePlatformAdmin();
  const parsed = updateClinicRequestSchema.safeParse(data);
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
  if (req.status !== "PENDING" && req.status !== "RETURNED") {
    return {
      ok: false,
      errors: { requestId: ["Cette demande ne peut plus être modifiée."] },
    } as const;
  }

  const cleaned: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) cleaned.name = parsed.data.name;
  if (parsed.data.email !== undefined) cleaned.email = parsed.data.email;
  if (parsed.data.phone !== undefined)
    cleaned.phone = parsed.data.phone || undefined;
  if (parsed.data.address !== undefined)
    cleaned.address = parsed.data.address || undefined;
  if (parsed.data.city !== undefined)
    cleaned.city = parsed.data.city || undefined;
  if (parsed.data.wilaya !== undefined)
    cleaned.wilaya = parsed.data.wilaya || undefined;
  if (parsed.data.ownerFirstName !== undefined)
    cleaned.ownerFirstName = parsed.data.ownerFirstName;
  if (parsed.data.ownerLastName !== undefined)
    cleaned.ownerLastName = parsed.data.ownerLastName;
  if (parsed.data.ownerEmail !== undefined)
    cleaned.ownerEmail = parsed.data.ownerEmail;
  if (parsed.data.doctorCount !== undefined)
    cleaned.doctorCount = parsed.data.doctorCount;
  if (parsed.data.assistantCount !== undefined)
    cleaned.assistantCount = parsed.data.assistantCount;
  if (parsed.data.secretaryCount !== undefined)
    cleaned.secretaryCount = parsed.data.secretaryCount;
  if (parsed.data.specialty !== undefined)
    cleaned.specialty = parsed.data.specialty || undefined;
  if (parsed.data.equipmentNeeds !== undefined)
    cleaned.equipmentNeeds = parsed.data.equipmentNeeds || undefined;
  if (parsed.data.requestedPlan !== undefined)
    cleaned.requestedPlan = parsed.data.requestedPlan;
  if (parsed.data.adminComment !== undefined)
    cleaned.adminComment = parsed.data.adminComment || undefined;

  const updated = await prisma.clinicRequest.update({
    where: { id: parsed.data.requestId },
    data: cleaned,
  });

  revalidatePath("/superadmin/clinic-requests");
  return { ok: true, request: updated } as const;
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
        plan: req.requestedPlan,
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

    // Initialize counters
    const counterTypes = [
      "PATIENT",
      "INVOICE",
      "QUOTE",
      "PRESCRIPTION",
      "LAB_ORDER",
    ];
    await prisma.counter.createMany({
      data: counterTypes.map((type) => ({
        clinicId: clinic.id,
        type,
        value: 0,
      })),
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        clinicId: clinic.id,
        userId: admin.userId,
        action: "CREATE",
        entityType: "Clinic",
        entityId: clinic.id,
        metadata: { source: "clinicRequest", requestId: req.id },
      },
    });

    await prisma.clinicRequest.update({
      where: { id: parsed.data.requestId },
      data: {
        status: "APPROVED",
        reviewedById: admin.userId,
        reviewedAt: new Date(),
        notes: parsed.data.notes || undefined,
        adminComment: parsed.data.adminComment || undefined,
      },
    });
  } else if (parsed.data.status === "RETURNED") {
    await prisma.clinicRequest.update({
      where: { id: parsed.data.requestId },
      data: {
        status: "RETURNED",
        reviewedById: admin.userId,
        reviewedAt: new Date(),
        notes: parsed.data.notes || undefined,
        adminComment: parsed.data.adminComment || undefined,
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
        adminComment: parsed.data.adminComment || undefined,
      },
    });
  }

  revalidatePath("/superadmin/clinic-requests");
  return { ok: true } as const;
}

export async function approveClinicRequestFromForm(formData: FormData) {
  const requestId = formData.get("requestId") as string;
  await reviewClinicRequest({ requestId, status: "APPROVED" });
}

export async function returnClinicRequestFromForm(formData: FormData) {
  const requestId = formData.get("requestId") as string;
  await reviewClinicRequest({
    requestId,
    status: "RETURNED",
    adminComment: "Demande incomplète. Veuillez fournir plus de détails.",
  });
}

export async function rejectClinicRequestFromForm(formData: FormData) {
  const requestId = formData.get("requestId") as string;
  await reviewClinicRequest({ requestId, status: "REJECTED" });
}

// ===================================================================
// User management (superadmin)
// ===================================================================

export async function listAllUsers(search?: string) {
  await requirePlatformAdmin();
  return prisma.user.findMany({
    where: search
      ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      clinic: { select: { name: true, slug: true, isActive: true } },
    },
  });
}

export async function toggleUserStatus(data: unknown) {
  const admin = await requirePlatformAdmin();
  const parsed = toggleUserStatusSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  const user = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
  });
  if (!user) {
    return {
      ok: false,
      errors: { userId: ["Utilisateur introuvable."] },
    } as const;
  }

  const updated = await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { isActive: !user.isActive },
  });

  await prisma.auditLog.create({
    data: {
      clinicId: user.clinicId ?? undefined,
      userId: admin.userId,
      action: "UPDATE",
      entityType: "User",
      entityId: user.id,
      metadata: { isActive: updated.isActive },
    },
  });

  revalidatePath("/superadmin/users");
  return { ok: true, user: updated } as const;
}

export async function toggleUserStatusFromForm(formData: FormData) {
  const userId = formData.get("userId") as string;
  await toggleUserStatus({ userId });
}

export async function updateUserRole(data: unknown) {
  const admin = await requirePlatformAdmin();
  const parsed = updateUserRoleSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  const user = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
  });
  if (!user) {
    return {
      ok: false,
      errors: { userId: ["Utilisateur introuvable."] },
    } as const;
  }

  const updated = await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { role: parsed.data.role },
  });

  await prisma.auditLog.create({
    data: {
      clinicId: user.clinicId ?? undefined,
      userId: admin.userId,
      action: "UPDATE",
      entityType: "User",
      entityId: user.id,
      metadata: { oldRole: user.role, newRole: updated.role },
    },
  });

  revalidatePath("/superadmin/users");
  return { ok: true, user: updated } as const;
}

export async function setUserRoleFromForm(formData: FormData) {
  const userId = formData.get("userId") as string;
  const role = formData.get("role") as Role;
  await updateUserRole({ userId, role });
}

// ===================================================================
// Payment requests
// ===================================================================

export async function sendPaymentRequest(data: unknown) {
  const admin = await requirePlatformAdmin();
  const parsed = sendPaymentRequestSchema.safeParse(data);
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

  // Create subscription payment record
  const now = new Date();
  const expiresAt = new Date(
    now.getFullYear() + 1,
    now.getMonth(),
    now.getDate(),
  );

  await prisma.subscriptionPayment.create({
    data: {
      clinicId: parsed.data.clinicId,
      plan: parsed.data.plan,
      amountCents: parsed.data.amountCents,
      status: "ACTIVE",
      startedAt: now,
      expiresAt,
    },
  });

  await prisma.clinic.update({
    where: { id: parsed.data.clinicId },
    data: {
      plan: parsed.data.plan,
      paymentStatus: "REQUESTED",
      paymentRequestedAt: now,
    },
  });

  await prisma.auditLog.create({
    data: {
      clinicId: parsed.data.clinicId,
      userId: admin.userId,
      action: "CREATE",
      entityType: "SubscriptionPayment",
      metadata: {
        plan: parsed.data.plan,
        amountCents: parsed.data.amountCents,
        notes: parsed.data.notes,
      },
    },
  });

  revalidatePath("/superadmin/clinics");
  revalidatePath(`/superadmin/clinics/${parsed.data.clinicId}`);
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

  const defaults = {
    openTickets: 0,
    pendingRequests: 0,
    totalMessages: 0,
    recentMessages: [] as {
      id: string;
      title: string;
      content: string;
      type: string;
      createdAt: Date;
    }[],
    pendingClinicRequests: 0,
    totalUsers: 0,
    totalClinics: 0,
  };

  try {
    const [
      openTickets,
      pendingRequests,
      totalMessages,
      recentMessages,
      pendingClinicRequests,
      totalUsers,
      totalClinics,
    ] = await Promise.all([
      prisma.supportTicket.count({ where: { status: "OPEN" } }),
      prisma.userRequest.count({ where: { status: "PENDING" } }),
      prisma.platformMessage.count(),
      prisma.platformMessage.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.clinicRequest.count({ where: { status: "PENDING" } }),
      prisma.user.count(),
      prisma.clinic.count(),
    ]);

    return {
      openTickets,
      pendingRequests,
      totalMessages,
      recentMessages,
      pendingClinicRequests,
      totalUsers,
      totalClinics,
    };
  } catch (error) {
    console.error("getSuperAdminStats failed:", error);
    return defaults;
  }
}
