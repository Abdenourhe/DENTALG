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
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  User,
  RotateCcw,
  Pencil,
  Users,
  Stethoscope,
  Wrench,
} from "lucide-react";
import { RequestStatus } from "@prisma/client";
import { reviewClinicRequest, updateClinicRequest } from "../actions";

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
    returned: requests.filter((r) => r.status === "RETURNED").length,
  };

  const statusBadge = (s: RequestStatus) => {
    switch (s) {
      case "PENDING":
        return (
          <Badge variant="warning" pulse>
            <Clock className="mr-1 h-3 w-3" />
            En attente
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge variant="success">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Approuvé
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="danger">
            <XCircle className="mr-1 h-3 w-3" />
            Rejeté
          </Badge>
        );
      case "RETURNED":
        return (
          <Badge
            variant="default"
            className="bg-amber-100 text-amber-800 ring-amber-200"
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Retourné
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Demandes de cabinets" }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Demandes de cabinets
          </h1>
          <p className="mt-1 text-slate-500">
            Approuvez, retournez ou rejetez les demandes de création de cabinet.
          </p>
        </div>
        <Link
          href="/superadmin/clinics"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Retour aux cabinets
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-5">
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
        <Link href="/superadmin/clinic-requests?status=RETURNED">
          <Card className="transition-all hover:shadow-md">
            <CardContent className="flex items-center gap-3 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                <RotateCcw className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">
                  {counts.returned}
                </p>
                <p className="text-xs text-slate-500">Retournées</p>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cabinet</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Propriétaire</TableHead>
                <TableHead>Détails</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>
                    <p className="font-semibold text-slate-900">{req.name}</p>
                    <p className="text-xs text-slate-500">{req.slug}</p>
                    <p className="text-xs text-slate-400">
                      Plan: {req.requestedPlan}
                    </p>
                  </TableCell>
                  <TableCell>
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
                    {req.wilaya && (
                      <p className="text-xs text-slate-400">{req.wilaya}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-slate-900">
                      <User className="h-3.5 w-3.5" />
                      {req.ownerFirstName} {req.ownerLastName}
                    </div>
                    <p className="text-xs text-slate-500">{req.ownerEmail}</p>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5 text-xs text-slate-600">
                      {req.doctorCount !== null && (
                        <div className="flex items-center gap-1">
                          <Stethoscope className="h-3 w-3" />
                          {req.doctorCount} médecin(s)
                        </div>
                      )}
                      {req.assistantCount !== null && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {req.assistantCount} assistant(s)
                        </div>
                      )}
                      {req.secretaryCount !== null && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {req.secretaryCount} secrétaire(s)
                        </div>
                      )}
                      {req.specialty && (
                        <div className="flex items-center gap-1">
                          <Stethoscope className="h-3 w-3" />
                          {req.specialty}
                        </div>
                      )}
                      {req.equipmentNeeds && (
                        <div className="flex items-center gap-1">
                          <Wrench className="h-3 w-3" />
                          {req.equipmentNeeds}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{statusBadge(req.status)}</TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {new Date(req.createdAt).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="text-right">
                    {(req.status === "PENDING" ||
                      req.status === "RETURNED") && (
                      <div className="flex flex-col items-end gap-2">
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
                              status: "RETURNED",
                              adminComment:
                                "Demande incomplète. Veuillez fournir plus de détails.",
                            });
                          }}
                        >
                          <button
                            type="submit"
                            className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200 transition-colors hover:bg-amber-100"
                          >
                            Retourner
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
                    {req.status === "APPROVED" && (
                      <span className="text-xs text-emerald-600">
                        Approuvé le{" "}
                        {req.reviewedAt
                          ? new Date(req.reviewedAt).toLocaleDateString("fr-FR")
                          : "—"}
                      </span>
                    )}
                    {req.status === "RETURNED" && req.adminComment && (
                      <div className="mt-1 max-w-[200px] rounded bg-amber-50 p-2 text-xs text-amber-800">
                        {req.adminComment}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {requests.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-12 text-center text-slate-500"
                  >
                    <Building2 className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-3 text-sm font-medium">
                      Aucune demande trouvée.
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
