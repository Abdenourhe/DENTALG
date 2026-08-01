"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "./actions";
import { Building2, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const [state, submitAction] = useActionState(loginAction, null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
            <Building2 className="h-7 w-7 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Connexion cabinet
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Espace réservé aux comptes cabinets (propriétaire, dentiste, etc.).
          </p>
        </div>

        <form action={submitAction} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email de connexion
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input
                name="email"
                type="email"
                placeholder="dr.benali@email.dz"
                required
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Utilisez l&apos;email du compte administrateur, pas celui du
              cabinet.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <input name="provider" type="hidden" value="clinic" />

          {state?.ok === false && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Se connecter
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Pas de compte ?{" "}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:underline"
          >
            Créer un cabinet
          </Link>
        </p>

        <p className="mt-4 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
          Admin plateforme ?{" "}
          <Link
            href="/superadmin/login"
            className="font-medium text-slate-700 hover:underline"
          >
            Se connecter ici
          </Link>
        </p>
      </div>
    </main>
  );
}
