import Link from "next/link";
import { listUserRequests, reviewUserRequestFromForm } from "../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  UserPlus,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Shield,
  Stethoscope,
  Users,
  Phone,
} from "lucide-react";
import { Role } from "@prisma/client";

const roleConfig: Record<
  Role,
  { label: string; icon: typeof Shield; color: string; badge: string }
> = {
  OWNER: {
    label: "Propriétaire",
    icon: Shield,
    color: "text-amber-600",
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  DENTIST: {
    label: "Dentiste",
    icon: Stethoscope,
    color: "text-emerald-600",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  ASSISTANT: {
    label: "Assistant(e)",
    icon: Users,
    color: "text-sky-600",
    badge: "bg-sky-50 text-sky-700 ring-sky-200",
  },
  SECRETARY: {
    label: "Secrétaire",
    icon: Phone,
    color: "text-primary-600",
    badge: "bg-primary-50 text-primary-700 ring-primary-200",
  },
  PLATFORM_ADMIN: {
    label: "Admin plateforme",
    icon: Shield,
    color: "text-red-600",
    badge: "bg-red-50 text-red-700 ring-red-200",
  },
};

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const requests = await listUserRequests(status);

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "PENDING").length,
    approved: requests.filter((r) => r.status === "APPROVED").length,
    rejected: requests.filter((r) => r.status === "REJECTED").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Demandes de profils
          </h1>
          <p className="mt-1 text-slate-500">
            Approuvez ou rejetez les demandes de création de comptes.
          </p>
        </div>
        <Link
          href="/superadmin"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Link href="/superadmin/requests">
          <Card className="transition-all hover:shadow-md">
            <CardContent className="flex items-center gap-3 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <UserPlus className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {counts.all}
                </p>
                <p className="text-xs text-slate-500">Total</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/superadmin/requests?status=PENDING">
          <Card className="transition-all hover:shadow-md">
            <CardContent className="flex items-center gap-3 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {counts.pending}
                </p>
                <p className="text-xs text-slate-500">En attente</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/superadmin/requests?status=APPROVED">
          <Card className="transition-all hover:shadow-md">
            <CardContent className="flex items-center gap-3 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">
                  {counts.approved}
                </p>
                <p className="text-xs text-slate-500">Approuvées</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/superadmin/requests?status=REJECTED">
          <Card className="transition-all hover:shadow-md">
            <CardContent className="flex items-center gap-3 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {counts.rejected}
                </p>
                <p className="text-xs text-slate-500">Rejetées</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader className="border-b px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <UserPlus className="h-5 w-5 text-slate-500" />
            Demandes ({requests.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-3">Demandeur</th>
                  <th className="px-6 py-3">Profil demandé</th>
                  <th className="px-6 py-3">Cabinet</th>
                  <th className="px-6 py-3">Demandé par</th>
                  <th className="px-6 py-3">Statut</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {requests.map((req) => {
                  const roleCfg = roleConfig[req.role];
                  const RoleIcon = roleCfg.icon;
                  return (
                    <tr
                      key={req.id}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">
                          {req.lastName} {req.firstName}
                        </p>
                        <p className="text-xs text-slate-500">{req.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${roleCfg.badge}`}
                        >
                          <RoleIcon
                            className={`h-3.5 w-3.5 ${roleCfg.color}`}
                          />
                          {roleCfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {req.clinic.name}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {req.requester.firstName} {req.requester.lastName}
                      </td>
                      <td className="px-6 py-4">
                        {req.status === "PENDING" && (
                          <Badge variant="warning" pulse>
                            <Clock className="mr-1 h-3 w-3" />
                            En attente
                          </Badge>
                        )}
                        {req.status === "APPROVED" && (
                          <Badge variant="success">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Approuvé
                          </Badge>
                        )}
                        {req.status === "REJECTED" && (
                          <Badge variant="danger">
                            <XCircle className="mr-1 h-3 w-3" />
                            Rejeté
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(req.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {req.status === "PENDING" && (
                          <div className="flex items-center justify-end gap-2">
                            <form action={reviewUserRequestFromForm}>
                              <input
                                type="hidden"
                                name="requestId"
                                value={req.id}
                              />
                              <input
                                type="hidden"
                                name="status"
                                value="APPROVED"
                              />
                              <button
                                type="submit"
                                className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 transition-colors hover:bg-emerald-100"
                              >
                                Approuver
                              </button>
                            </form>
                            <form action={reviewUserRequestFromForm}>
                              <input
                                type="hidden"
                                name="requestId"
                                value={req.id}
                              />
                              <input
                                type="hidden"
                                name="status"
                                value="REJECTED"
                              />
                              <button
                                type="submit"
                                className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 ring-1 ring-red-200 transition-colors hover:bg-red-100"
                              >
                                Rejeter
                              </button>
                            </form>
                          </div>
                        )}
                        {req.status !== "PENDING" && (
                          <span className="text-xs text-slate-400">
                            {req.reviewedAt
                              ? new Date(req.reviewedAt).toLocaleDateString(
                                  "fr-FR",
                                )
                              : "—"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {requests.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      <UserPlus className="mx-auto h-10 w-10 text-slate-300" />
                      <p className="mt-3 text-sm font-medium">
                        Aucune demande trouvée.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
