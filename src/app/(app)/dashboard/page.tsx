import { prisma } from "@/lib/prisma";
import { requireClinicContext } from "@/lib/tenant";
import { requireRole } from "@/lib/rbac";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/date";
import { formatDA } from "@/lib/money";

export default async function DashboardPage() {
  await requireRole("patients:read");
  const ctx = await requireClinicContext();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    patientCount,
    todayAppointments,
    pendingInvoices,
    monthlyRevenue,
    recentPatients,
    upcomingAppointments,
  ] = await Promise.all([
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
        paidAt: { gte: new Date(today.getFullYear(), today.getMonth(), 1) },
      },
      _sum: { amountCents: true },
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Tableau de bord</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-slate-500">Patients</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{patientCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-slate-500">RDV aujourd&apos;hui</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{todayAppointments}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-slate-500">Factures en attente</p>
            <p className="mt-1 text-3xl font-bold text-amber-600">{pendingInvoices}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-slate-500">Revenus ce mois</p>
            <p className="mt-1 text-3xl font-bold text-green-600">
              {formatDA(monthlyRevenue._sum.amountCents ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Prochains rendez-vous</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <p className="text-sm text-slate-500">Aucun rendez-vous à venir.</p>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {a.patient.lastName} {a.patient.firstName}
                      </p>
                      <p className="text-xs text-slate-500">
                        Dr. {a.dentist.lastName} — {formatDate(a.startAt)}
                      </p>
                    </div>
                    <Badge variant={a.status === "CONFIRMED" ? "info" : "default"}>
                      {a.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Derniers patients</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPatients.length === 0 ? (
              <p className="text-sm text-slate-500">Aucun patient enregistré.</p>
            ) : (
              <div className="space-y-3">
                {recentPatients.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {p.lastName} {p.firstName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {p.phone ?? "—"} — {formatDate(p.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
