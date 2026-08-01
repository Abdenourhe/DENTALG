"use client";

import { useActionState } from "react";
import { adminLoginAction } from "./actions";

export default function AdminLoginPage() {
  const [state, submitAction] = useActionState(adminLoginAction, null);

  return (
    <main className="flex min-h-full items-center justify-center p-6">
      <form action={submitAction} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Admin plateforme</h1>

        <input
          name="email"
          type="email"
          placeholder="Email admin"
          required
          className="w-full rounded border p-2"
        />
        <input
          name="password"
          type="password"
          placeholder="Mot de passe"
          required
          className="w-full rounded border p-2"
        />
        <input name="provider" type="hidden" value="platform" />

        {state?.ok === false && (
          <div className="rounded bg-red-100 p-2 text-sm text-red-800">
            {state.error}
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded bg-foreground p-2 text-background"
        >
          Se connecter
        </button>
      </form>
    </main>
  );
}
