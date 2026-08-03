"use client";

import { useActionState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { registerClinic } from "./actions";
import {
  Building2,
  ArrowLeft,
  User,
  Mail,
  Lock,
  Hash,
  MapPin,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const [state, submitAction] = useActionState(registerClinic, null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
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
              Créer un compte cabinet
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Cet email et ce mot de passe seront utilisés pour vous connecter.
            </p>
          </div>

          <form action={submitAction} className="space-y-5">
            {/* Clinic section */}
            <fieldset className="space-y-4 rounded-xl border border-slate-200 p-4">
              <legend className="px-2 text-sm font-semibold text-slate-700">
                Cabinet
              </legend>
              <Input
                name="clinicName"
                type="text"
                label="Nom du cabinet"
                placeholder="Cabinet Dentaire Benali"
                icon={<Building2 className="h-5 w-5" />}
                required
              />
              <Input
                name="clinicSlug"
                type="text"
                label="Slug (identifiant unique)"
                placeholder="cabinet-benali"
                icon={<Hash className="h-5 w-5" />}
                required
              />
              <Input
                name="clinicEmail"
                type="email"
                label="Email du cabinet"
                placeholder="contact@cabinet.dz"
                icon={<Mail className="h-5 w-5" />}
                required
              />
              <p className="text-xs text-slate-500">
                Cet email n&apos;est pas utilisé pour la connexion.
              </p>
            </fieldset>

            {/* Admin section */}
            <fieldset className="space-y-4 rounded-xl border border-slate-200 p-4">
              <legend className="px-2 text-sm font-semibold text-slate-700">
                Administrateur du cabinet
              </legend>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  name="firstName"
                  type="text"
                  label="Prénom"
                  icon={<User className="h-5 w-5" />}
                  required
                />
                <Input
                  name="lastName"
                  type="text"
                  label="Nom"
                  icon={<User className="h-5 w-5" />}
                  required
                />
              </div>
              <Input
                name="email"
                type="email"
                label="Email de connexion"
                placeholder="dr.benali@email.dz"
                icon={<Mail className="h-5 w-5" />}
                required
              />
              <p className="text-xs text-slate-500">
                Utilisez cet email pour vous connecter sur la page de login.
              </p>
              <Input
                name="password"
                type="password"
                label="Mot de passe"
                placeholder="••••••••"
                icon={<Lock className="h-5 w-5" />}
                required
              />
              <Input
                name="confirmPassword"
                type="password"
                label="Confirmer le mot de passe"
                placeholder="••••••••"
                icon={<Lock className="h-5 w-5" />}
                required
              />
            </fieldset>

            {state?.ok === false && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="overflow-hidden rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700 ring-1 ring-red-100"
              >
                {Object.entries(state.errors).map(([field, messages]) => (
                  <div key={field}>
                    <strong>{field}:</strong> {messages.join(", ")}
                  </div>
                ))}
              </motion.div>
            )}

            {state?.ok === true && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="overflow-hidden rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-100"
              >
                Compte créé avec succès. Connectez-vous avec l&apos;email de
                l&apos;administrateur.
              </motion.div>
            )}

            <Button type="submit" size="lg" className="w-full">
              Créer le compte
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Déjà un compte ?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
