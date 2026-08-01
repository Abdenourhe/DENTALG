import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import {
  isLocked,
  recordFailedAttempt,
  resetAttempts,
} from "@/lib/auth-lockout";

import { Role } from "@prisma/client";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  provider: z.enum(["clinic", "platform"]).default("clinic"),
});

const authSecret = process.env.AUTH_SECRET;
if (!authSecret && process.env.NODE_ENV === "production") {
  throw new Error(
    "AUTH_SECRET est manquant. Définissez-le dans les variables d'environnement Vercel.",
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
        provider: { label: "Provider", type: "text" },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password, provider } = parsed.data;
        const lockKey = `${provider}:${email}`;

        if (isLocked(lockKey)) {
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.isActive) {
          recordFailedAttempt(lockKey);
          return null;
        }

        if (provider === "platform" && user.role !== "PLATFORM_ADMIN") {
          recordFailedAttempt(lockKey);
          return null;
        }
        if (provider === "clinic" && user.role === "PLATFORM_ADMIN") {
          recordFailedAttempt(lockKey);
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          recordFailedAttempt(lockKey);
          return null;
        }

        resetAttempts(lockKey);

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          clinicId: user.clinicId,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.clinicId = user.clinicId;
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user.id = token.id as string;
      session.user.role = token.role as Role;
      session.user.clinicId = (token.clinicId as string | null) ?? null;
      return session;
    },
  },
});
