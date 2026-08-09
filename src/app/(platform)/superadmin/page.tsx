import { requirePlatformAdmin } from "@/lib/platform-auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Building2,
  Users,
  UserRound,
  Banknote,
  ArrowUpRight,
  TrendingUp,
  Ticket,
  UserPlus,
  Megaphone,
  Store,
  AlertTriangle,
  Activity,
  CalendarCheck,
  CreditCard,
  Settings,
} from "lucide-react";
import { getSuperAdminStats } from "./actions";

export default async function SuperAdminDashboardPage() {
  await requirePlatformAdmin();

  let clinicsCount = 0;
  let usersCount = 0;
  let patientsCount = 0;
  let totalRevenue = 0;
  let activeClinics = 0;
  let recentClinics: Awaited<
    ReturnType<
      typeof prisma.clinic.findMany<{
        include: { _count: { select: { users: true; patients: true } } };
      }>
    >
  > = [];
  let loadError: string | null = null;
  let planCounts: Record<string, number> = {};
  let todayAppointments = 0;

  try {
    const results = await Promise.all([
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
      prisma.clinic.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { _count: { select: { users: true, patients: true } } },
      }),
      prisma.clinic.groupBy({
        by: ["plan"],
        _count: { plan: true },
      }),
      prisma.appointment.count({
        where: {
          deletedAt: null,
          startAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    clinicsCount = results[0];
    usersCount = results[1];
    patientsCount = results[2];
    totalRevenue = results[3];
    activeClinics = results[4];
    recentClinics = results[5];
    planCounts = Object.fromEntries(
      results[6].map((p) => [p.plan, p._count.plan]),
    );
    todayAppointments = results[7];
  } catch (error) {
    loadError = error instanceof Error ? error.message : String(error);
    console.error("SuperAdmin dashboard data load failed:", error);
  }

  const stats = await getSuperAdminStats();

  const formatDA = (cents: number) =>
    new Intl.NumberFormat("fr-DZ", {
      style: "currency",
      currency: "DZD",
    }).format(cents / 100);

  const mainStats = [
    {
      label: "Cabinets",
      value: clinicsCount,
      sub: `${activeClinics} actifs · ${clinicsCount - activeClinics} inactifs`,
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
      label: "RDV aujourd'hui",
      value: todayAppointments,
      sub: "sur toute la plateforme",
      icon: CalendarCheck,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
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

  const alertStats = [
    {
      label: "Tickets ouverts",
      value: stats.openTickets,
      icon: Ticket,
      color: "text-red-600",
      bg: "bg-red-50",
      href: "/superadmin/tickets",
    },
    {
      label: "Demandes cabinets",
      value: stats.pendingClinicRequests,
      icon: Store,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
      href: "/superadmin/clinic-requests",
    },
    {
      label: "Demandes profils",
      value: stats.pendingRequests,
      icon: UserPlus,
      color: "text-orange-600",
      bg: "bg-orange-50",
      href: "/superadmin/requests",
    },
    {
      label: "Messages envoyés",
      value: stats.totalMessages,
      icon: Megaphone,
      color: "text-purple-600",
      bg: "bg-purple-50",
      href: "/superadmin/messages",
    },
  ];

  const planLabels: Record<string, string> = {
    FREE: "Gratuit",
    ESSENTIEL: "Essentiel",
    PRO: "Pro",
    PREMIUM: "Premium",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Tableau de bord plateforme
          </h1>
          <p className="mt-1 text-slate-500">
            Suivez l&apos;activité de tous les cabinets en temps réel.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/superadmin/clinics">
            <Button variant="secondary" className="gap-2">
              <Building2 className="h-4 w-4" />
              Cabinets
            </Button>
          </Link>
          <Link href="/superadmin/clinic-requests">
            <Button className="gap-2">
              Voir les demandes
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {loadError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4" />
            Certaines statistiques n&apos;ont pas pu être chargées
          </div>
          <p className="mt-1 text-xs text-amber-700">
            Erreur : {loadError}. Vérifiez que les migrations Prisma sont à
            jour.
          </p>
        </div>
      )}

      {/* Main stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {mainStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{stat.sub}</p>
                  </div>
                  <div className={`rounded-lg ${stat.bg} p-2.5`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alert stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {alertStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="overflow-hidden transition-all hover:border-slate-300 hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={`rounded-lg ${stat.bg} p-2.5`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                  </div>
                  {stat.value > 0 && (
                    <Badge variant="danger" pulse>
                      {stat.value}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent clinics */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Building2 className="h-5 w-5 text-blue-600" />
              Cabinets récents
            </CardTitle>
            <Link
              href="/superadmin/clinics"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Voir tout →
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentClinics.map((clinic) => (
                <div
                  key={clinic.id}
                  className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/superadmin/clinics/${clinic.id}`}
                        className="font-semibold text-slate-900 hover:text-blue-600"
                      >
                        {clinic.name}
                      </Link>
                      <Badge
                        variant={clinic.isActive ? "success" : "danger"}
                        className="text-[10px]"
                      >
                        {clinic.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {clinic.city ?? "Ville non renseignée"} · Plan{" "}
                      {planLabels[clinic.plan] ?? clinic.plan} ·{" "}
                      {clinic._count.users} utilisateurs ·{" "}
                      {clinic._count.patients} patients
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/superadmin/clinics/${clinic.id}`}>
                      <Button size="sm" variant="ghost">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/superadmin/clinics/${clinic.id}`}>
                      <Button size="sm" variant="secondary" className="gap-1">
                        Détails
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
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

        {/* Side cards */}
        <div className="space-y-6">
          {/* Plan repartition */}
          <Card>
            <CardHeader className="border-b px-6 py-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <CreditCard className="h-5 w-5 text-emerald-600" />
                Répartition par plan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {Object.entries(planLabels).map(([plan, label]) => (
                  <div
                    key={plan}
                    className="flex items-center justify-between px-6 py-3"
                  >
                    <span className="text-sm text-slate-600">{label}</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {planCounts[plan] ?? 0}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent messages */}
          <Card>
            <CardHeader className="border-b px-6 py-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Megaphone className="h-5 w-5 text-purple-600" />
                Messages récents
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {stats.recentMessages.map((msg) => (
                  <div key={msg.id} className="px-6 py-3">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {msg.title}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                      {msg.content}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Badge
                        variant="default"
                        className="px-1.5 py-0 text-[10px]"
                      >
                        {msg.type}
                      </Badge>
                      <span className="text-[10px] text-slate-400">
                        {new Date(msg.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </div>
                ))}
                {stats.recentMessages.length === 0 && (
                  <p className="px-6 py-8 text-center text-sm text-slate-500">
                    Aucun message envoyé.
                  </p>
                )}
              </div>
              <div className="border-t px-6 py-3">
                <Link
                  href="/superadmin/messages"
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Voir tous les messages →
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Activity link */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-white/10 p-2">
                  <Activity className="h-5 w-5 text-blue-300" />
                </div>
                <div>
                  <p className="font-semibold">Audit &amp; activité</p>
                  <p className="mt-1 text-xs text-slate-300">
                    Consultez les journaux d&apos;actions des cabinets et
                    utilisateurs.
                  </p>
                  <Link href="/superadmin/clinics">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="mt-3 gap-1 bg-white/10 text-white hover:bg-white/20"
                    >
                      Voir les cabinets
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
