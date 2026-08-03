import { auth } from "@/auth";
import { redirect } from "next/navigation";

export interface PlatformAdminSession {
  userId: string;
  email: string;
}

export async function requirePlatformAdmin(): Promise<PlatformAdminSession> {
  const session = await auth();

  if (session?.user?.role !== "PLATFORM_ADMIN") {
    redirect("/superadmin/login");
  }

  return {
    userId: session.user.id,
    email: session.user.email ?? "",
  };
}
