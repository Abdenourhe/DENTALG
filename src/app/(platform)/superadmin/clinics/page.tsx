import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toggleClinicStatus } from "../actions";
import { Building2, Eye, ArrowLeft } from "lucide-react";

export default async function ClinicsPage() {
  const clinics = await prisma.clinic.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { users: true, patients: true, invoices: true },
      },
    },
  });

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
        <Link
          href="/superadmin"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au tableau de bord
        </Link>
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
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Cabinet</th>
                  <th className="px-6 py-3 font-medium">Contact</th>
                  <th className="px-6 py-3 font-medium">Plan</th>
                  <th className="px-6 py-3 font-medium text-center">Utilisateurs</th>
                  <th className="px-6 py-3 font-medium text-center">Patients</th>
                  <th className="px-6 py-3 font-medium text-center">Factures</th>
                  <th className="px-6 py-3 font-medium">Statut</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {clinics.map((clinic) => (
                  <tr key={clinic.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{clinic.name}</div>
                      <div className="text-xs text-slate-500">{clinic.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{clinic.email}</div>
                      <div className="text-xs text-slate-500">{clinic.phone ?? "-"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="info">{clinic.plan}</Badge>
                    </td>
                    <td className="px-6 py-4 text-center">{clinic._count.users}</td>
                    <td className="px-6 py-4 text-center">{clinic._count.patients}</td>
                    <td className="px-6 py-4 text-center">{clinic._count.invoices}</td>
                    <td className="px-6 py-4">
                      <Badge variant={clinic.isActive ? "success" : "danger"}>
                        {clinic.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <form action={toggleClinicStatus}>
                          <input type="hidden" name="clinicId" value={clinic.id} />
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
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
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
