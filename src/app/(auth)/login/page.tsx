"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const result = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    if (result?.ok) {
      window.location.href = result.url || "/dashboard";
    } else {
      setError("Email ou mot de passe incorrect.");
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Connexion cabinet</h1>
          <p className="mt-2 text-sm text-slate-500">
            Espace réservé aux comptes cabinets.
          </p>
        </div>

        <form action={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email de connexion</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="dr.benali@demo.dz"
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" isLoading={pending}>
            Se connecter
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link
            href="/forgot-password"
            className="text-primary hover:text-primary-700"
          >
            Mot de passe oublié ?
          </Link>
        </div>
      </div>

      <p className="mt-6 text-xs text-slate-400">
        © {new Date().getFullYear()} DENTALG
      </p>
    </div>
  );
}
