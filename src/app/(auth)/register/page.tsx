"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerClinic } from "./actions";

export default function RegisterPage() {
  const [state, submitAction] = useActionState(registerClinic, null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Créer un compte cabinet
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Cet email et ce mot de passe seront utilisés pour vous connecter.
          </p>
        </div>

        <form action={submitAction} className="space-y-6">
          <fieldset className="space-y-3 rounded-lg border border-slate-200 p-4">
            <legend className="px-2 text-sm font-semibold text-slate-700">
              Cabinet
            </legend>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Nom du cabinet
              </label>
              <input
                name="clinicName"
                type="text"
                placeholder="Cabinet Dentaire Benali"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Slug (identifiant unique)
              </label>
              <input
                name="clinicSlug"
                type="text"
                placeholder="cabinet-benali"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Email du cabinet
              </label>
              <input
                name="clinicEmail"
                type="email"
                placeholder="contact@cabinet.dz"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-slate-500">
                Cet email n&apos;est pas utilisé pour la connexion.
              </p>
            </div>
          </fieldset>

          <fieldset className="space-y-3 rounded-lg border border-slate-200 p-4">
            <legend className="px-2 text-sm font-semibold text-slate-700">
              Administrateur du cabinet
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Prénom
                </label>
                <input
                  name="firstName"
                  type="text"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Nom
                </label>
                <input
                  name="lastName"
                  type="text"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Email de connexion
              </label>
              <input
                name="email"
                type="email"
                placeholder="dr.benali@email.dz"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-slate-500">
                Utilisez cet email pour vous connecter sur la page de login.
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Mot de passe
              </label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Confirmer le mot de passe
              </label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </fieldset>

          {state?.ok === false && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {Object.entries(state.errors).map(([field, messages]) => (
                <div key={field}>
                  <strong>{field}:</strong> {messages.join(", ")}
                </div>
              ))}
            </div>
          )}

          {state?.ok === true && (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              Compte créé avec succès. Connectez-vous avec l&apos;email de
              l&apos;administrateur.
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Créer le compte
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Déjà un compte ?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
