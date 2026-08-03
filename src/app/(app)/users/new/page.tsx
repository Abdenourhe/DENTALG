"use client";

import { useActionState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createUser } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  UserPlus,
  Mail,
  User,
  Lock,
  Stethoscope,
  Users,
  Phone,
} from "lucide-react";
import { Role } from "@prisma/client";

const roleOptions = [
  {
    value: Role.DENTIST,
    label: "Dentiste",
    icon: Stethoscope,
    desc: "Gère les patients, prescriptions et actes",
  },
  {
    value: Role.ASSISTANT,
    label: "Assistant(e)",
    icon: Users,
    desc: "Aide à la consultation et aux soins",
  },
  {
    value: Role.SECRETARY,
    label: "Secrétaire",
    icon: Phone,
    desc: "Gère les rendez-vous et la facturation",
  },
];

type CreateUserState =
  | { ok: true; user: { id: string; email: string } }
  | { ok: false; errors: Record<string, string[]> }
  | null;

export default function NewUserPage() {
  const [state, submitAction] = useActionState(
    async (_prevState: CreateUserState, formData: FormData) => {
      const data = Object.fromEntries(formData.entries());
      return createUser(data) as Promise<CreateUserState>;
    },
    null,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-xl space-y-6"
    >
      <Link
        href="/users"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux utilisateurs
      </Link>

      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Inviter un utilisateur
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Créez un compte pour un nouveau membre de l&apos;équipe.
        </p>
      </div>

      <form action={submitAction} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Input
            name="firstName"
            label="Prénom"
            placeholder="Amine"
            icon={<User className="h-5 w-5" />}
            required
          />
          <Input
            name="lastName"
            label="Nom"
            placeholder="Benali"
            icon={<User className="h-5 w-5" />}
            required
          />
        </div>

        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="amine@cabinet.dz"
          icon={<Mail className="h-5 w-5" />}
          required
        />

        <Input
          name="password"
          type="password"
          label="Mot de passe"
          placeholder="••••••••"
          icon={<Lock className="h-5 w-5" />}
          required
        />

        {/* Role selection */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Rôle
          </label>
          <div className="space-y-2">
            {roleOptions.map((role) => {
              const Icon = role.icon;
              return (
                <label
                  key={role.value}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 transition-all hover:border-primary-300 hover:bg-primary-50/30 has-[:checked]:border-primary has-[:checked]:bg-primary-50 has-[:checked]:ring-1 has-[:checked]:ring-primary"
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    defaultChecked={role.value === Role.DENTIST}
                    className="mt-1 h-4 w-4 accent-primary"
                  />
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {role.label}
                      </p>
                      <p className="text-xs text-slate-500">{role.desc}</p>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {state?.ok === false && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="overflow-hidden rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700 ring-1 ring-red-100"
          >
            {Object.entries(state.errors).map(([field, messages]) => (
              <div key={field}>
                <strong>{field}:</strong>{" "}
                {Array.isArray(messages)
                  ? messages.join(", ")
                  : String(messages)}
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
            Utilisateur créé avec succès. Un email a été envoyé à{" "}
            {state.user.email}.
          </motion.div>
        )}

        <div className="flex gap-3 pt-2">
          <Link href="/users" className="flex-1">
            <Button type="button" variant="secondary" className="w-full">
              Annuler
            </Button>
          </Link>
          <Button type="submit" className="flex-1">
            <UserPlus className="mr-2 h-4 w-4" />
            Créer l&apos;utilisateur
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
