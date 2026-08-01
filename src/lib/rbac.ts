import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { notFound } from "next/navigation";
import { PERMISSIONS } from "./permissions";

export { PERMISSIONS } from "./permissions";

export async function requireRole(permission: string): Promise<void> {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;

  if (!role || !PERMISSIONS[permission]?.includes(role)) {
    notFound();
  }
}
