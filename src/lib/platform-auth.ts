import { auth } from "@/auth";
import { notFound } from "next/navigation";

export interface PlatformAdminSession {
  userId: string;
  email: string;
}

export async function requirePlatformAdmin(): Promise<PlatformAdminSession> {
  const session = await auth();

  if (session?.user?.role !== "PLATFORM_ADMIN") {
    notFound();
  }

  return {
    userId: session.user.id,
    email: session.user.email ?? "",
  };
}
