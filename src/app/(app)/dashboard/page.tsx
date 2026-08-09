import { prisma } from "@/lib/prisma";
import { requireClinicContext } from "@/lib/tenant";
import { requireRole } from "@/lib/rbac";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/date";
import { formatDA } from "@/lib/money";
import {
  StaggerContainer,
  FadeUp,
  PageWrapper,
} from "@/components/ui/animations";
import {
  Users,
  CalendarCheck,
  Receipt,
  TrendingUp,
  ArrowRight,
  Clock,
  DoorOpen,
  Building2,
} from "lucide-react";
import Link from "next/link";

const stats = [
  {
    label: "Patients",
    key: "patientCount" as const,
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50",
    ring: "ring-blue-200",
  },
  {
    label: "RDV aujourd'hui",
    key: "todayAppointments" as const,
    icon: CalendarCheck,
    color: "text-purple-600",
    bg: "bg-purple-50",
    ring: "ring-purple-200",
  },
  {
    label: "Factures en attente",
    key: "pendingInvoices" as const,
    icon: Receipt,
    color: "text-amber-600",
    bg: "bg-amber-50",
    ring: "ring-amber-200",
  },
  {
    label: "Revenus ce mois",
    key: "monthlyRevenue" as const,
    icon: TrendingUp,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200",
  },
  {
    label: "En salle d'attente",
    key: "waitingRoomCount" as const,
    icon: Clock,
    color: "text-violet-600",
    bg: "bg-violet-50",
    ring: "ring-violet-200",
    href: "/waiting-room",
  },
];

export default async function DashboardPage() {
  await requireRole("patients:read");
  const ctx = await requireClinicContext();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    clinic,
    patientCount,
    todayAppointments,
    pendingInvoices,
    monthlyRevenue,
    waitingRoomCount,
    recentPatients,
    upcomingAppointments,
  ] = await Promise.all([
    prisma.clinic.findUnique({
      where: { id: ctx.clinicId },
      select: { name: true, logoUrl: true, city: true, phone: true },
    }),
    prisma.patient.count({
      where: { clinicId: ctx.clinicId, deletedAt: null },
    }),
    prisma.appointment.count({
      where: {
        clinicId: ctx.clinicId,
        deletedAt: null,
        startAt: { gte: today, lt: tomorrow },
      },
    }),
    prisma.invoice.count({
      where: {
        clinicId: ctx.clinicId,
        deletedAt: null,
        status: { in: ["ISSUED", "OVERDUE"] },
      },
    }),
    prisma.payment.aggregate({
      where: {
        clinicId: ctx.clinicId,
        paidAt: { gte: firstDayOfMonth },
      },
      _sum: { amountCents: true },
    }),
    prisma.waitingRoomEntry.count({
      where: {
        clinicId: ctx.clinicId,
        deletedAt: null,
        status: { in: ["WAITING", "CALLED", "IN_PROGRESS"] },
        arrivedAt: { gte: today, lt: tomorrow },
      },
    }),
    prisma.patient.findMany({
      where: { clinicId: ctx.clinicId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.appointment.findMany({
      where: {
        clinicId: ctx.clinicId,
        deletedAt: null,
        startAt: { gte: today },
        status: { in: ["SCHEDULED", "CONFIRMED"] },
      },
      orderBy: { startAt: "asc" },
      take: 5,
      include: {
        patient: { select: { firstName: true, lastName: true } },
        dentist: { select: { firstName: true, lastName: true } },
      },
    }),
  ]);

  const values: Record<string, number | string> = {
    patientCount,
    todayAppointments,
    pendingInvoices,
    monthlyRevenue: formatDA(monthlyRevenue._sum.amountCents ?? 0),
    waitingRoomCount,
  };

  return (
    <PageWrapper className="space-y-8">
      {/* Clinic header */}
      <FadeUp>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col gap-4 bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {clinic?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={clinic.logoUrl}
                    alt="Logo cabinet"
                    className="h-14 w-auto rounded-lg bg-white/10 object-contain p-1"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white/10">
                    <Building2 className="h-7 w-7 text-white/80" />
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold">
                    {clinic?.name ?? "Cabinet"}
                  </h1>
                  <p className="text-sm text-slate-300">
                    {clinic?.city ?? "Ville non renseignée"}
                    {clinic?.phone && ` · ${clinic.phone}`}
                  </p>
                </div>
              </div>
              <Link href="/waiting-room">
                <Button
                  variant="secondary"
                  className="gap-2 bg-white/10 text-white hover:bg-white/20"
                >
                  <DoorOpen className="h-4 w-4" />
                  Salle d&apos;attente
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </FadeUp>

      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Tableau de bord
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Vue d&apos;ensemble de votre cabinet
          </p>
        </div>
        <span className="hidden text-sm text-slate-400 sm:block">
          {formatDate(today)}
        </span>
      </div>

      {/* Stat cards */}
      <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const value = values[stat.key];
          const card = (
            <Card className="group h-full transition-all hover:border-slate-300 hover:shadow-sm">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.label}
                    </p>
                    <p
                      className={`mt-2 text-3xl font-bold tracking-tight ${stat.color}`}
                    >
                      {value}
                    </p>
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg} ring-1 ${stat.ring} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );

          return stat.href ? (
            <Link key={stat.key} href={stat.href}>
              {card}
            </Link>
          ) : (
            <FadeUp key={stat.key}>{card}</FadeUp>
          );
        })}
      </StaggerContainer>

      {/* Lists */}
      <StaggerContainer className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FadeUp>
          <Card>
            <CardHeader>
              <CardTitle>Prochains rendez-vous</CardTitle>
              <Link
                href="/appointments"
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Voir tout <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CalendarCheck className="h-10 w-10 text-slate-300" />
                  <p className="mt-2 text-sm text-slate-500">
                    Aucun rendez-vous à venir.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingAppointments.map((a) => (
                    <div
                      key={a.id}
                      className="group flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3 transition-all duration-200 hover:border-slate-200 hover:bg-white hover:shadow-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {a.patient.lastName} {a.patient.firstName}
                        </p>
                        <p className="text-xs text-slate-500">
                          Dr. {a.dentist.lastName} — {formatDate(a.startAt)}
                        </p>
                      </div>
                      <Badge
                        variant={a.status === "CONFIRMED" ? "info" : "default"}
                        pulse={a.status === "SCHEDULED"}
                      >
                        {a.status === "CONFIRMED" ? "Confirmé" : "Planifié"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </FadeUp>

        <FadeUp>
          <Card>
            <CardHeader>
              <CardTitle>Derniers patients</CardTitle>
              <Link
                href="/patients"
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Voir tout <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent>
              {recentPatients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="h-10 w-10 text-slate-300" />
                  <p className="mt-2 text-sm text-slate-500">
                    Aucun patient enregistré.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentPatients.map((p) => (
                    <div
                      key={p.id}
                      className="group flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3 transition-all duration-200 hover:border-slate-200 hover:bg-white hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-700 ring-1 ring-primary-100">
                          {p.firstName[0]}
                          {p.lastName[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {p.lastName} {p.firstName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {p.phone ?? "—"} — {formatDate(p.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </FadeUp>
      </StaggerContainer>
    </PageWrapper>
  );
}
