"use client";

import { useActionState } from "react";
import { adminLoginAction } from "./actions";
import { Shield, Lock } from "lucide-react";

export default function AdminLoginPage() {
  const [state, submitAction] = useActionState(adminLoginAction, null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin plateforme</h1>
          <p className="mt-2 text-sm text-slate-500">
            Espace réservé à l&apos;administration DENTALG.
          </p>
        </div>

        <form action={submitAction} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <div className="relative">
              <input
                name="email"
                type="email"
                placeholder="admin@dentalg.dz"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 pl-11 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="pointer-events-none absolute left-3 top-3 text-slate-400">
                @
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Mot de passe
            </label>
            <div className="relative">
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 pl-11 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            </div>
          </div>

          <input name="provider" type="hidden" value="platform" />

          {state?.ok === false && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Se connecter
          </button>
        </form>
      </div>
    </main>
  );
}
