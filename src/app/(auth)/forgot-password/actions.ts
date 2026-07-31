"use server";

import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import crypto from "crypto";
import bcrypt from "bcrypt";

type ForgotPasswordResult = { ok: true } | { ok: false; error: string };

export async function sendPasswordReset(
  _prevState: ForgotPasswordResult | null,
  formData: FormData
): Promise<ForgotPasswordResult> {
  const email = formData.get("email");

  if (typeof email !== "string" || !email.includes("@")) {
    return { ok: false, error: "Email invalide." };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Ne pas révéler l'existence du compte.
    return { ok: true };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = await bcrypt.hash(token, 10);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "DENTALG <noreply@dentalg.dz>",
      to: email,
      subject: "Réinitialisation de votre mot de passe",
      html: `<p>Bonjour,</p>
        <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
        <p><a href="${appUrl}/reset-password?token=${token}">Réinitialiser mon mot de passe</a></p>
        <p>Ce lien est valable 1 heure.</p>`,
    });
  }

  return { ok: true };
}
