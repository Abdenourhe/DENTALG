"use server";

import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/platform-auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, ArrowLeft, Eye, Mail, Phone, MapPin } from "lucide-react";
import SuperAdminErrorFallback from "../_components/SuperAdminErrorFallback";
import { toggleClinicStatusFromForm } from "../actions";
import { Prisma } from "@prisma/client";

type ClinicWithCounts = Prisma.ClinicGetPayload<{
  include: {
    _count: { select: { users: true; patients: true; invoices: true } };
  };
}>;

export default async function ClinicsPage() {
  await requirePlatformAdmin();

  let clinics: ClinicWithCounts[] = [];
  let loadError: string | null = null;

  try {
    clinics = await prisma.clinic.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { users: true, patients: true, invoices: true },
        },
      },
    });
  } catch (error) {
    loadError = error instanceof Error ? error.message : String(error);
    console.error("ClinicsPage load failed:", error);
  }

  if (loadError) {
    return <SuperAdminErrorFallback error={loadError} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Gestion des cabinets
          </h1>
          <p className="mt-1 text-slate-500">
            {clinics.length} cabinet{clinics.length > 1 ? "s" : ""} au total.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/superadmin/clinic-requests"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Demandes
          </Link>
          <Link
            href="/superadmin"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Building2 className="h-5 w-5 text-blue-600" />
            Liste des cabinets
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">Cabinet</th>
                  <th className="px-6 py-3">Contact</th>
                  <th className="px-6 py-3">Plan</th>
                  <th className="px-6 py-3 text-center">Utilisateurs</th>
                  <th className="px-6 py-3 text-center">Patients</th>
                  <th className="px-6 py-3 text-center">Factures</th>
                  <th className="px-6 py-3">Statut</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {clinics.map((clinic) => (
                  <tr
                    key={clinic.id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">
                        {clinic.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {clinic.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Mail className="h-3.5 w-3.5" />
                        {clinic.email}
                      </div>
                      {clinic.phone && (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Phone className="h-3.5 w-3.5" />
                          {clinic.phone}
                        </div>
                      )}
                      {(clinic.city || clinic.wilaya) && (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="h-3.5 w-3.5" />
                          {clinic.city}
                          {clinic.city && clinic.wilaya ? ", " : ""}
                          {clinic.wilaya}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="info">{clinic.plan}</Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {clinic._count.users}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {clinic._count.patients}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {clinic._count.invoices}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={clinic.isActive ? "success" : "danger"}>
                        {clinic.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <form action={toggleClinicStatusFromForm}>
                          <input
                            type="hidden"
                            name="clinicId"
                            value={clinic.id}
                          />
                          <Button
                            type="submit"
                            variant={clinic.isActive ? "secondary" : "primary"}
                            size="sm"
                          >
                            {clinic.isActive ? "Désactiver" : "Activer"}
                          </Button>
                        </form>
                        <Link href={`/superadmin/clinics/${clinic.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {clinics.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      Aucun cabinet enregistré.
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
