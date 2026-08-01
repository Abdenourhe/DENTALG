"use server";

import { signIn } from "../../../../auth";
import { AuthError } from "next-auth";

type LoginResult = { ok: true } | { ok: false; error: string };

export async function loginAction(
  _prevState: LoginResult | null,
  formData: FormData
): Promise<LoginResult> {
  const raw = Object.fromEntries(formData.entries());

  try {
    await signIn("credentials", {
      ...raw,
      redirectTo: "/dashboard",
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: "Email ou mot de passe incorrect." };
    }
    throw error;
  }
}
