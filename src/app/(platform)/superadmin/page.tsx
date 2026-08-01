import { requirePlatformAdmin } from "@/lib/platform-auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function SuperAdminDashboardPage() {
  await requirePlatformAdmin();

  const [clinicsCount, usersCount, patientsCount, totalRevenue] =
    await Promise.all([
      prisma.clinic.count(),
      prisma.user.count({ where: { role: { not: "PLATFORM_ADMIN" } } }),
      prisma.patient.count(),
      prisma.invoice.count({ where: { status: "ISSUED" } }),
      prisma.invoice
        .aggregate({
          where: { status: "ISSUED" },
          _sum: { totalCents: true },
        })
        .then((r) => r._sum.totalCents ?? 0),
    ]);

  const recentClinics = await prisma.clinic.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { _count: { select: { users: true, patients: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord plateforme</h1>
        <p className="text-muted-foreground">Vue d&apos;ensemble de l&apos;activité.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Cabinets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{clinicsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{usersCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{patientsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Chiffre facturé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(totalRevenue / 100).toLocaleString("fr-DZ")} DA
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cabinets récents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {recentClinics.map((clinic) => (
              <div
                key={clinic.id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <Link
                    href={`/superadmin/clinics/${clinic.id}`}
                    className="font-medium hover:underline"
                  >
                    {clinic.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {clinic.city}, {clinic.wilaya} · {clinic._count.users} users ·{" "}
                    {clinic._count.patients} patients
                  </p>
                </div>
                <Badge variant={clinic.isActive ? "success" : "danger"}>
                  {clinic.isActive ? "Actif" : "Inactif"}
                </Badge>
              </div>
            ))}
            {recentClinics.length === 0 && (
              <p className="text-muted-foreground">Aucun cabinet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
