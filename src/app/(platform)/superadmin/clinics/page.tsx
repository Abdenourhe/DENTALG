import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toggleClinicStatus } from "../actions";

export default async function ClinicsPage() {
  const clinics = await prisma.clinic.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { users: true, patients: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestion des cabinets</h1>
        <p className="text-muted-foreground">
          {clinics.length} cabinet{clinics.length > 1 ? "s" : ""} au total.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des cabinets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {clinics.map((clinic) => (
              <div
                key={clinic.id}
                className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <Link
                    href={`/superadmin/clinics/${clinic.id}`}
                    className="font-medium hover:underline"
                  >
                    {clinic.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {clinic.email} · {clinic.city ?? "-"} · Plan {clinic.plan}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {clinic._count.users} utilisateurs · {clinic._count.patients}{" "}
                    patients
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={clinic.isActive ? "success" : "danger"}>
                    {clinic.isActive ? "Actif" : "Inactif"}
                  </Badge>
                  <form action={toggleClinicStatus}>
                    <input type="hidden" name="clinicId" value={clinic.id} />
                    <Button type="submit" variant="secondary" size="sm">
                      {clinic.isActive ? "Désactiver" : "Activer"}
                    </Button>
                  </form>
                  <Link href={`/superadmin/clinics/${clinic.id}`}>
                    <Button variant="ghost" size="sm">
                      Détails
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
            {clinics.length === 0 && (
              <p className="py-4 text-muted-foreground">Aucun cabinet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
