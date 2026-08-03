import { notFound } from "next/navigation";
import Link from "next/link";
import { getUser, updateUser } from "../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageWrapper } from "@/components/ui/animations";
import {
  ArrowLeft,
  Shield,
  Stethoscope,
  Users,
  Phone,
  Mail,
  Clock,
  CalendarDays,
  Save,
} from "lucide-react";
import { Role } from "@prisma/client";
import { formatDate } from "@/lib/date";

interface Props {
  params: Promise<{ id: string }>;
}

const roleOptions = [
  {
    value: Role.OWNER,
    label: "Propriétaire",
    icon: Shield,
    desc: "Contrôle total du cabinet",
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  {
    value: Role.DENTIST,
    label: "Dentiste",
    icon: Stethoscope,
    desc: "Patients, prescriptions et actes",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  {
    value: Role.ASSISTANT,
    label: "Assistant(e)",
    icon: Users,
    desc: "Aide à la consultation",
    color: "text-sky-600 bg-sky-50 border-sky-200",
  },
  {
    value: Role.SECRETARY,
    label: "Secrétaire",
    icon: Phone,
    desc: "Rendez-vous et facturation",
    color: "text-primary-600 bg-primary-50 border-primary-200",
  },
];

export default async function UserDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await getUser(id);
  if (!user) notFound();

  const selectedRole = roleOptions.find((r) => r.value === user.role)!;

  return (
    <PageWrapper className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/users"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux utilisateurs
      </Link>

      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {user.firstName} {user.lastName}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Gérez les informations et le rôle de cet utilisateur.
        </p>
      </div>

      {/* Profile card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-xl font-bold text-primary-700 ring-2 ring-primary-200">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {user.firstName} {user.lastName}
              </h3>
              <p className="flex items-center gap-1.5 text-sm text-slate-500">
                <Mail className="h-4 w-4" />
                {user.email}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant={user.isActive ? "success" : "danger"}>
                  {user.isActive ? "Actif" : "Inactif"}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Inscrit le {formatDate(user.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit form */}
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData: FormData) => {
              "use server";
              const data = Object.fromEntries(formData.entries());
              await updateUser(id, {
                firstName: data.firstName as string,
                lastName: data.lastName as string,
                role: data.role as Role,
                isActive: data.isActive === "on",
              });
            }}
            className="space-y-5"
          >
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="firstName"
                label="Prénom"
                defaultValue={user.firstName}
                required
              />
              <Input
                name="lastName"
                label="Nom"
                defaultValue={user.lastName}
                required
              />
            </div>

            {/* Role selection */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Rôle
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {roleOptions.map((role) => {
                  const Icon = role.icon;
                  const isSelected = role.value === user.role;
                  return (
                    <label
                      key={role.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${
                        isSelected
                          ? `${role.color} ring-1`
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        defaultChecked={isSelected}
                        className="h-4 w-4 accent-primary"
                      />
                      <div className="flex items-center gap-2">
                        <Icon
                          className={`h-5 w-5 ${isSelected ? role.color.split(" ")[0] : "text-slate-400"}`}
                        />
                        <div>
                          <p
                            className={`text-sm font-semibold ${isSelected ? "text-slate-900" : "text-slate-600"}`}
                          >
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

            {/* Active toggle */}
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-colors hover:bg-slate-50">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={user.isActive}
                className="h-5 w-5 rounded border-slate-300 accent-primary"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Compte actif
                </p>
                <p className="text-xs text-slate-500">
                  Désactivez pour empêcher l&apos;accès sans supprimer le
                  compte.
                </p>
              </div>
            </label>

            <div className="flex justify-end">
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Enregistrer les modifications
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Activité</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <span className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="h-4 w-4 text-slate-400" />
                Dernière connexion
              </span>
              <span className="text-sm font-medium text-slate-900">
                {user.lastLoginAt
                  ? formatDate(user.lastLoginAt)
                  : "Jamais connecté"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <span className="flex items-center gap-2 text-sm text-slate-600">
                <CalendarDays className="h-4 w-4 text-slate-400" />
                Date d&apos;inscription
              </span>
              <span className="text-sm font-medium text-slate-900">
                {formatDate(user.createdAt)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
