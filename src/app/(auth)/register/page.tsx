"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerClinic } from "./actions";

export default function RegisterPage() {
  const [state, submitAction] = useActionState(registerClinic, null);

  return (
    <main className="flex min-h-full items-center justify-center p-6">
      <form
        action={submitAction}
        className="w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold">Créer un compte</h1>

        <fieldset className="space-y-2">
          <legend className="font-medium">Cabinet</legend>
          <input
            name="clinicName"
            type="text"
            placeholder="Nom du cabinet"
            required
            className="w-full rounded border p-2"
          />
          <input
            name="clinicSlug"
            type="text"
            placeholder="Slug (ex: mon-cabinet)"
            required
            className="w-full rounded border p-2"
          />
          <input
            name="clinicEmail"
            type="email"
            placeholder="Email du cabinet"
            required
            className="w-full rounded border p-2"
          />
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="font-medium">Administrateur</legend>
          <input
            name="firstName"
            type="text"
            placeholder="Prénom"
            required
            className="w-full rounded border p-2"
          />
          <input
            name="lastName"
            type="text"
            placeholder="Nom"
            required
            className="w-full rounded border p-2"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
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
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirmer le mot de passe"
            required
            className="w-full rounded border p-2"
          />
        </fieldset>

        {state?.ok === false && (
          <div className="rounded bg-red-100 p-2 text-sm text-red-800">
            {Object.entries(state.errors).map(([field, messages]) => (
              <div key={field}>
                <strong>{field}:</strong> {messages.join(", ")}
              </div>
            ))}
          </div>
        )}

        {state?.ok === true && (
          <div className="rounded bg-green-100 p-2 text-sm text-green-800">
            Compte créé avec succès. Vous pouvez maintenant vous connecter.
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded bg-foreground p-2 text-background"
        >
          Créer le compte
        </button>

        <p className="text-sm">
          Déjà un compte ?{" "}
          <Link href="/login" className="underline">
            Se connecter
          </Link>
        </p>
      </form>
    </main>
  );
}
