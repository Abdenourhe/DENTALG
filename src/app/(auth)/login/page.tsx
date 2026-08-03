"use client";

import { useActionState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { loginAction } from "./actions";
import { Building2, Lock, Mail, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [state, submitAction] = useActionState(loginAction, null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Back to home */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l&apos;accueil
        </Link>

        <div className="rounded-2xl bg-white p-8 shadow-lg shadow-slate-200/50">
          <div className="mb-6 text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: 0.1,
              }}
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 ring-1 ring-primary-100"
            >
              <Building2 className="h-7 w-7 text-primary" />
            </motion.div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Connexion cabinet
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Espace réservé aux comptes cabinets (propriétaire, dentiste,
              etc.).
            </p>
          </div>

          <form action={submitAction} className="space-y-5">
            <Input
              name="email"
              type="email"
              label="Email de connexion"
              placeholder="dr.benali@email.dz"
              icon={<Mail className="h-5 w-5" />}
              required
            />
            <p className="-mt-3 text-xs text-slate-500">
              Utilisez l&apos;email du compte administrateur, pas celui du
              cabinet.
            </p>

            <Input
              name="password"
              type="password"
              label="Mot de passe"
              placeholder="••••••••"
              icon={<Lock className="h-5 w-5" />}
              required
            />

            <input name="provider" type="hidden" value="clinic" />

            {state?.ok === false && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="overflow-hidden rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700 ring-1 ring-red-100"
              >
                {state.error}
              </motion.div>
            )}

            <Button type="submit" size="lg" className="w-full">
              Se connecter
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Pas de compte ?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary hover:underline"
            >
              Créer un cabinet
            </Link>
          </p>

          <div className="mt-4 border-t border-slate-100 pt-4 text-center">
            <Link
              href="/superadmin/login"
              className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-800"
            >
              Admin plateforme ? Se connecter ici
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
