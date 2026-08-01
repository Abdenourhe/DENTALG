"use server";

import { signIn } from "../../../../../auth";
import { AuthError } from "next-auth";

type AdminLoginResult = { ok: true } | { ok: false; error: string };

export async function adminLoginAction(
  _prevState: AdminLoginResult | null,
  formData: FormData
): Promise<AdminLoginResult> {
  const raw = Object.fromEntries(formData.entries());

  try {
    await signIn("credentials", {
      ...raw,
      redirectTo: "/superadmin",
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: "Email ou mot de passe incorrect." };
    }
    throw error;
  }
}
