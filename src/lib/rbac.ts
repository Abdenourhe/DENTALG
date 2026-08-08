import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { PERMISSIONS, type Permission } from "./permissions";

export async function requireRole(permission: Permission) {
  const session = await auth();
  const allowedRoles = PERMISSIONS[permission];

  if (!session?.user?.role || !(allowedRoles as string[]).includes(session.user.role)) {
    notFound();
  }

  return session.user;
}

export async function requirePlatformAdmin() {
  const session = await auth();
  if (session?.user?.role !== "PLATFORM_ADMIN") {
    notFound();
  }
  return session.user;
}
