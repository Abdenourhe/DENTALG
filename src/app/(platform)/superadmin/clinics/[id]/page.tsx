import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Building2,
  Users,
  UserRound,
  Receipt,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  Calendar,
} from "lucide-react";

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

  const formatDA = (cents: number) =>
    new Intl.NumberFormat("fr-DZ", { style: "currency", currency: "DZD" }).format(
      cents / 100
    );

  const revenue = await prisma.invoice
    .aggregate({
      where: { clinicId: clinic.id, status: "ISSUED" },
      _sum: { totalCents: true },
    })
    .then((r) => r._sum.totalCents ?? 0);

  const stats = [
    { label: "Utilisateurs", value: clinic._count.users, icon: Users },
    { label: "Patients", value: clinic._count.patients, icon: UserRound },
    { label: "Factures", value: clinic._count.invoices, icon: Receipt },
    { label: "Chiffre", value: formatDA(revenue), icon: Building2 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/superadmin/clinics"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux cabinets
        </Link>
        <Badge variant={clinic.isActive ? "success" : "danger"} className="text-xs">
          {clinic.isActive ? "Actif" : "Inactif"}
        </Badge>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {clinic.name}
        </h1>
        <p className="mt-1 text-slate-500">{clinic.slug}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-lg bg-blue-50 p-3">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b px-6 py-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <MapPin className="h-5 w-5 text-blue-600" />
              Informations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-500">Email</p>
                <p className="text-slate-900">{clinic.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-500">Téléphone</p>
                <p className="text-slate-900">{clinic.phone ?? "-"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-500">Adresse</p>
                <p className="text-slate-900">
                  {clinic.address ?? "-"}
                  {clinic.city && `, ${clinic.city}`}
                  {clinic.wilaya && ` (${clinic.wilaya})`}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-500">Créé le</p>
                <p className="text-slate-900">
                  {new Date(clinic.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b px-6 py-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Users className="h-5 w-5 text-blue-600" />
              Utilisateurs ({clinic.users.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {clinic.users.map((user) => (
                <div key={user.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="font-medium text-slate-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                  <Badge variant="info">{user.role}</Badge>
                </div>
              ))}
              {clinic.users.length === 0 && (
                <p className="px-6 py-8 text-center text-slate-500">
                  Aucun utilisateur.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <UserRound className="h-5 w-5 text-blue-600" />
            Derniers patients
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {clinic.patients.map((patient) => (
              <div key={patient.id} className="px-6 py-3">
                <p className="font-medium text-slate-900">
                  {patient.firstName} {patient.lastName}
                </p>
                <p className="text-sm text-slate-500">
                  N° {patient.number} · {patient.phone ?? "Pas de téléphone"}
                </p>
              </div>
            ))}
            {clinic.patients.length === 0 && (
              <p className="px-6 py-8 text-center text-slate-500">
                Aucun patient.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
