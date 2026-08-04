"use server";

import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/platform-auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { RequestStatus } from "@prisma/client";
import { reviewClinicRequest } from "../actions";

export default async function ClinicRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requirePlatformAdmin();
  const { status } = await searchParams;

  const requests = await prisma.clinicRequest.findMany({
    where: status ? { status: status as RequestStatus } : undefined,
    orderBy: { createdAt: "desc" },
  });

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
            Demandes de cabinets
          </h1>
          <p className="mt-1 text-slate-500">
            Approuvez ou rejetez les demandes de création de cabinet.
          </p>
        </div>
        <Link
          href="/superadmin/clinics"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux cabinets
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Link href="/superadmin/clinic-requests">
          <Card className="transition-all hover:shadow-md">
            <CardContent className="flex items-center gap-3 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <Building2 className="h-5 w-5 text-slate-600" />
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
        <Link href="/superadmin/clinic-requests?status=PENDING">
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
        <Link href="/superadmin/clinic-requests?status=APPROVED">
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
        <Link href="/superadmin/clinic-requests?status=REJECTED">
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
            <Building2 className="h-5 w-5 text-slate-500" />
            Demandes ({requests.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-3">Cabinet</th>
                  <th className="px-6 py-3">Contact</th>
                  <th className="px-6 py-3">Propriétaire</th>
                  <th className="px-6 py-3">Statut</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    className="transition-colors hover:bg-slate-50/80"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{req.name}</p>
                      <p className="text-xs text-slate-500">{req.slug}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Mail className="h-3.5 w-3.5" />
                        {req.email}
                      </div>
                      {req.phone && (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Phone className="h-3.5 w-3.5" />
                          {req.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-slate-900">
                        <User className="h-3.5 w-3.5" />
                        {req.ownerFirstName} {req.ownerLastName}
                      </div>
                      <p className="text-xs text-slate-500">{req.ownerEmail}</p>
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
                          <form
                            action={async () => {
                              "use server";
                              await reviewClinicRequest({
                                requestId: req.id,
                                status: "APPROVED",
                              });
                            }}
                          >
                            <button
                              type="submit"
                              className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 transition-colors hover:bg-emerald-100"
                            >
                              Approuver
                            </button>
                          </form>
                          <form
                            action={async () => {
                              "use server";
                              await reviewClinicRequest({
                                requestId: req.id,
                                status: "REJECTED",
                              });
                            }}
                          >
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
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      <Building2 className="mx-auto h-10 w-10 text-slate-300" />
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
