import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function ClinicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const clinic = await prisma.clinic.findUnique({
    where: { id },
    include: {
      users: { orderBy: { createdAt: "desc" } },
      patients: { take: 5, orderBy: { createdAt: "desc" } },
      _count: {
        select: { users: true, patients: true, invoices: true },
      },
    },
  });

  if (!clinic) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{clinic.name}</h1>
          <p className="text-muted-foreground">{clinic.slug}</p>
        </div>
        <Badge variant={clinic.isActive ? "success" : "danger"}>
          {clinic.isActive ? "Actif" : "Inactif"}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{clinic._count.users}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{clinic._count.patients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Factures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{clinic._count.invoices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{clinic.plan}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Email :</strong> {clinic.email}
          </p>
          <p>
            <strong>Téléphone :</strong> {clinic.phone ?? "-"}
          </p>
          <p>
            <strong>Adresse :</strong> {clinic.address ?? "-"}
          </p>
          <p>
            <strong>Ville :</strong> {clinic.city ?? "-"}, {clinic.wilaya ?? "-"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs du cabinet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {clinic.users.map((user) => (
              <div key={user.id} className="py-3">
                <p className="font-medium">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user.email} · {user.role}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Link href="/superadmin/clinics">
          <span className="text-sm underline">← Retour à la liste</span>
        </Link>
      </div>
    </div>
  );
}
