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
  MessageSquare,
  Ticket,
  UserPlus,
  Megaphone,
  AlertCircle,
  Clock,
} from "lucide-react";
import { getSuperAdminStats } from "./actions";

export default async function SuperAdminDashboardPage() {
  await requirePlatformAdmin();

  const [
    clinicsCount,
    usersCount,
    patientsCount,
    totalRevenue,
    activeClinics,
    stats,
  ] = await Promise.all([
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
    getSuperAdminStats(),
  ]);

  const recentClinics = await prisma.clinic.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { _count: { select: { users: true, patients: true } } },
  });

  const formatDA = (cents: number) =>
    new Intl.NumberFormat("fr-DZ", {
      style: "currency",
      currency: "DZD",
    }).format(cents / 100);

  const mainStats = [
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
      label: "Demandes en attente",
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

      {/* Main stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {mainStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.label}
                    </p>
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

      {/* Alert stats */}
      <div className="grid gap-6 sm:grid-cols-3">
        {alertStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="overflow-hidden transition-all hover:border-slate-300 hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className={`rounded-lg ${stat.bg} p-3`}>
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
            <CardTitle className="text-lg font-semibold">
              Cabinets récents
            </CardTitle>
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
                      {clinic._count.users} utilisateurs ·{" "}
                      {clinic._count.patients} patients
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

        {/* Recent messages */}
        <Card>
          <CardHeader className="border-b px-6 py-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Megaphone className="h-5 w-5 text-purple-600" />
              Messages récents
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {stats.recentMessages.map((msg) => (
                <div key={msg.id} className="px-6 py-3">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {msg.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {msg.content}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge
                      variant="default"
                      className="text-[10px] px-1.5 py-0"
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
      </div>
    </div>
  );
}
