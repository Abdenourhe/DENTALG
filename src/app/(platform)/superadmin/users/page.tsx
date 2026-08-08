"use server";

import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/platform-auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Stethoscope,
  Clock,
  Building2,
} from "lucide-react";
import { Prisma, Role } from "@prisma/client";
import { toggleUserStatusFromForm, setUserRoleFromForm } from "../actions";
import SuperAdminErrorFallback from "../_components/SuperAdminErrorFallback";

type UserWithClinic = Prisma.UserGetPayload<{
  include: { clinic: { select: { name: true; slug: true; isActive: true } } };
}>;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  await requirePlatformAdmin();
  const { search } = await searchParams;

  let users: UserWithClinic[] = [];
  let loadError: string | null = null;

  try {
    users = await prisma.user.findMany({
      where: search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        clinic: { select: { name: true, slug: true, isActive: true } },
      },
    });
  } catch (error) {
    loadError = error instanceof Error ? error.message : String(error);
    console.error("UsersPage load failed:", error);
  }

  if (loadError) {
    return <SuperAdminErrorFallback error={loadError} />;
  }

  const roleLabel = (role: Role) => {
    switch (role) {
      case "OWNER":
        return (
          <Badge variant="default" className="bg-violet-100 text-violet-800">
            <Shield className="mr-1 h-3 w-3" />
            Propriétaire
          </Badge>
        );
      case "DENTIST":
        return (
          <Badge variant="default" className="bg-sky-100 text-sky-800">
            <Stethoscope className="mr-1 h-3 w-3" />
            Médecin
          </Badge>
        );
      case "ASSISTANT":
        return (
          <Badge variant="default" className="bg-teal-100 text-teal-800">
            Assistant
          </Badge>
        );
      case "SECRETARY":
        return (
          <Badge variant="default" className="bg-slate-100 text-slate-700">
            <Clock className="mr-1 h-3 w-3" />
            Secrétaire
          </Badge>
        );
      case "PLATFORM_ADMIN":
        return (
          <Badge variant="default" className="bg-rose-100 text-rose-800">
            <Shield className="mr-1 h-3 w-3" />
            Super Admin
          </Badge>
        );
    }
  };

  const activeCount = users.filter((u) => u.isActive).length;
  const inactiveCount = users.filter((u) => !u.isActive).length;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Utilisateurs" }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Utilisateurs
          </h1>
          <p className="mt-1 text-slate-500">
            Gérez les profils, rôles et statuts de tous les utilisateurs.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <Users className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {users.length}
              </p>
              <p className="text-xs text-slate-500">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <UserCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">
                {activeCount}
              </p>
              <p className="text-xs text-slate-500">Actifs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
              <UserX className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{inactiveCount}</p>
              <p className="text-xs text-slate-500">Inactifs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <form action="/superadmin/users" className="flex gap-2">
        <input
          name="search"
          type="text"
          placeholder="Rechercher par nom ou email..."
          defaultValue={search || ""}
          className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
        />
        <button
          type="submit"
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          Rechercher
        </button>
      </form>

      <Card>
        <CardHeader className="border-b px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Users className="h-5 w-5 text-slate-500" />
            Utilisateurs ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Cabinet</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Connexion</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <p className="font-semibold text-slate-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </TableCell>
                  <TableCell>{roleLabel(user.role)}</TableCell>
                  <TableCell>
                    {user.clinic ? (
                      <div className="flex items-center gap-1 text-slate-600">
                        <Building2 className="h-3.5 w-3.5" />
                        <Link
                          href={`/superadmin/clinics/${user.clinic.slug}`}
                          className="text-xs hover:underline"
                        >
                          {user.clinic.name}
                        </Link>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <Badge variant="success">Actif</Badge>
                    ) : (
                      <Badge variant="danger">Inactif</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString("fr-FR")
                      : "Jamais"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end gap-2">
                      {/* Toggle active */}
                      <form action={toggleUserStatusFromForm}>
                        <input type="hidden" name="userId" value={user.id} />
                        <button
                          type="submit"
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium ring-1 transition-colors ${
                            user.isActive
                              ? "bg-red-50 text-red-700 ring-red-200 hover:bg-red-100"
                              : "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100"
                          }`}
                        >
                          {user.isActive ? "Désactiver" : "Activer"}
                        </button>
                      </form>

                      {/* Change role (skip PLATFORM_ADMIN) */}
                      {user.role !== "PLATFORM_ADMIN" && (
                        <div className="flex gap-1">
                          {user.role !== "OWNER" && (
                            <form action={setUserRoleFromForm}>
                              <input
                                type="hidden"
                                name="userId"
                                value={user.id}
                              />
                              <input type="hidden" name="role" value="OWNER" />
                              <button
                                type="submit"
                                className="rounded-lg bg-violet-50 px-2 py-1 text-[10px] font-medium text-violet-700 ring-1 ring-violet-200 hover:bg-violet-100"
                              >
                                Owner
                              </button>
                            </form>
                          )}
                          {user.role !== "DENTIST" && (
                            <form action={setUserRoleFromForm}>
                              <input
                                type="hidden"
                                name="userId"
                                value={user.id}
                              />
                              <input
                                type="hidden"
                                name="role"
                                value="DENTIST"
                              />
                              <button
                                type="submit"
                                className="rounded-lg bg-sky-50 px-2 py-1 text-[10px] font-medium text-sky-700 ring-1 ring-sky-200 hover:bg-sky-100"
                              >
                                Médecin
                              </button>
                            </form>
                          )}
                          {user.role !== "ASSISTANT" && (
                            <form action={setUserRoleFromForm}>
                              <input
                                type="hidden"
                                name="userId"
                                value={user.id}
                              />
                              <input
                                type="hidden"
                                name="role"
                                value="ASSISTANT"
                              />
                              <button
                                type="submit"
                                className="rounded-lg bg-teal-50 px-2 py-1 text-[10px] font-medium text-teal-700 ring-1 ring-teal-200 hover:bg-teal-100"
                              >
                                Assistant
                              </button>
                            </form>
                          )}
                          {user.role !== "SECRETARY" && (
                            <form action={setUserRoleFromForm}>
                              <input
                                type="hidden"
                                name="userId"
                                value={user.id}
                              />
                              <input
                                type="hidden"
                                name="role"
                                value="SECRETARY"
                              />
                              <button
                                type="submit"
                                className="rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                              >
                                Secrétaire
                              </button>
                            </form>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-slate-500"
                  >
                    <Users className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-3 text-sm font-medium">
                      Aucun utilisateur trouvé.
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
