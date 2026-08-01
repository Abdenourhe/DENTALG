import { requirePlatformAdmin } from "@/lib/platform-auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Building2,
  Users,
  UserRound,
  Banknote,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

export default async function SuperAdminDashboardPage() {
  await requirePlatformAdmin();

  const [clinicsCount, usersCount, patientsCount, totalRevenue, activeClinics] =
    await Promise.all([
      prisma.clinic.count(),
      prisma.user.count({ where: { role: { not: "PLATFORM_ADMIN" } } }),
      prisma.patient.count(),
      prisma.invoice
        .aggregate({
          where: { status: "ISSUED" },
          _sum: { totalCents: true },
        })
        .then((r) => r._sum.totalCents ?? 0),
      prisma.clinic.count({ where: { isActive: true } }),
    ]);

  const recentClinics = await prisma.clinic.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { _count: { select: { users: true, patients: true } } },
  });

  const formatDA = (cents: number) =>
    new Intl.NumberFormat("fr-DZ", { style: "currency", currency: "DZD" }).format(
      cents / 100
    );

  const stats = [
    {
      label: "Cabinets",
      value: clinicsCount,
      sub: `${activeClinics} actifs`,
      icon: Building2,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Utilisateurs",
      value: usersCount,
      sub: "comptes staff",
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Patients",
      value: patientsCount,
      sub: "dossiers médicaux",
      icon: UserRound,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Chiffre facturé",
      value: formatDA(totalRevenue),
      sub: "factures émises",
      icon: Banknote,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Tableau de bord plateforme
          </h1>
          <p className="mt-1 text-slate-500">
            Suivez l&apos;activité de tous les cabinets en temps réel.
          </p>
        </div>
        <Link
          href="/superadmin/clinics"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Voir les cabinets
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{stat.sub}</p>
                  </div>
                  <div className={`rounded-lg ${stat.bg} p-3`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
            <CardTitle className="text-lg font-semibold">Cabinets récents</CardTitle>
            <TrendingUp className="h-5 w-5 text-slate-400" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentClinics.map((clinic) => (
                <div
                  key={clinic.id}
                  className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50"
                >
                  <div>
                    <Link
                      href={`/superadmin/clinics/${clinic.id}`}
                      className="font-semibold text-slate-900 hover:text-blue-600"
                    >
                      {clinic.name}
                    </Link>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {clinic.city ?? "Ville non renseignée"} ·{" "}
                      {clinic._count.users} utilisateurs · {clinic._count.patients} patients
                    </p>
                  </div>
                  <Badge variant={clinic.isActive ? "success" : "danger"}>
                    {clinic.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </div>
              ))}
              {recentClinics.length === 0 && (
                <p className="px-6 py-8 text-center text-slate-500">
                  Aucun cabinet enregistré.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b px-6 py-4">
            <CardTitle className="text-lg font-semibold">Raccourcis</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <Link
                href="/superadmin/clinics"
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-slate-50"
              >
                <Building2 className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Gérer les cabinets</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
