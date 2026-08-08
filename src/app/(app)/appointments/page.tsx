import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  Stethoscope,
  Pencil,
  CalendarPlus,
  CalendarCheck,
} from "lucide-react";
import { listAppointments, getDentists } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PageWrapper,
  StaggerContainer,
  FadeUp,
} from "@/components/ui/animations";
import { formatDate, formatTime, addDays } from "@/lib/date";
import { AppointmentStatus } from "@prisma/client";

function capitalize(value: string): string {
  return value
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function statusLabel(status: AppointmentStatus): string {
  const labels: Record<AppointmentStatus, string> = {
    SCHEDULED: "Planifié",
    CONFIRMED: "Confirmé",
    CANCELLED: "Annulé",
    NO_SHOW: "Absent",
    COMPLETED: "Terminé",
  };
  return labels[status] ?? status;
}

function statusVariant(
  status: AppointmentStatus,
): "default" | "success" | "warning" | "danger" | "info" {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "CONFIRMED":
      return "info";
    case "SCHEDULED":
      return "warning";
    case "NO_SHOW":
      return "danger";
    case "CANCELLED":
      return "danger";
    default:
      return "default";
  }
}

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const currentDate = date ? new Date(date) : new Date();
  currentDate.setHours(0, 0, 0, 0);

  const prevDate = addDays(currentDate, -1);
  const nextDate = addDays(currentDate, 1);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday =
    currentDate.getFullYear() === today.getFullYear() &&
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getDate() === today.getDate();

  const [appointments, dentists] = await Promise.all([
    listAppointments(date),
    getDentists(),
  ]);

  const dateParam = (d: Date) => d.toISOString().slice(0, 10);

  const countsByStatus = appointments.reduce(
    (acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <PageWrapper className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Rendez-vous
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isToday ? "Aujourd'hui" : "Date sélectionnée"} —{" "}
            <span className="font-medium text-slate-700">
              {formatDate(currentDate)}
            </span>
            {appointments.length > 0 && (
              <span className="ml-2 text-slate-400">
                ({appointments.length} RDV)
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/appointments/calendar">
            <Button variant="secondary">
              <CalendarDays className="mr-2 h-4 w-4" />
              Calendrier
            </Button>
          </Link>
          <Link href="/appointments/new">
            <Button>
              <CalendarPlus className="mr-2 h-4 w-4" />
              Nouveau RDV
            </Button>
          </Link>
        </div>
      </div>

      {/* Date navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Link href={`/appointments?date=${dateParam(prevDate)}`}>
            <Button variant="secondary" size="sm">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Précédent
            </Button>
          </Link>
          <Link href={`/appointments?date=${dateParam(today)}`}>
            <Button variant="secondary" size="sm">
              Aujourd&apos;hui
            </Button>
          </Link>
          <Link href={`/appointments?date=${dateParam(nextDate)}`}>
            <Button variant="secondary" size="sm">
              Suivant
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <form className="flex items-center gap-2">
          <input
            name="date"
            type="date"
            defaultValue={dateParam(currentDate)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <Button type="submit" variant="secondary" size="sm">
            Filtrer
          </Button>
        </form>
      </div>

      {/* Status summary */}
      {appointments.length > 0 && (
        <StaggerContainer className="flex flex-wrap gap-2">
          {Object.entries(countsByStatus).map(([status, count]) => (
            <FadeUp key={status}>
              <Badge variant={statusVariant(status as AppointmentStatus)}>
                {statusLabel(status as AppointmentStatus)} : {count}
              </Badge>
            </FadeUp>
          ))}
        </StaggerContainer>
      )}

      <StaggerContainer stagger={0.04}>
        <FadeUp>
          <Card>
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <CalendarCheck className="h-5 w-5 text-slate-400" />
                Liste des rendez-vous
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="pb-3 pl-4 pt-2">Heure</th>
                      <th className="pb-3 pt-2">Patient</th>
                      <th className="pb-3 pt-2">Dentiste</th>
                      <th className="pb-3 pt-2">Motif</th>
                      <th className="pb-3 pt-2">Statut</th>
                      <th className="pb-3 pt-2 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointments.map((a) => (
                      <tr
                        key={a.id}
                        className="group transition-colors hover:bg-slate-50/80"
                      >
                        <td className="py-4 pl-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-slate-700">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                              <Clock className="h-4 w-4 text-slate-500" />
                            </div>
                            <span className="font-medium">
                              {formatTime(a.startAt)} — {formatTime(a.endAt)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-700">
                              {a.patient.firstName[0]}
                              {a.patient.lastName[0]}
                            </div>
                            <div>
                              <span className="font-medium text-slate-900">
                                {capitalize(a.patient.lastName)}{" "}
                                {capitalize(a.patient.firstName)}
                              </span>
                              {a.patient.phone && (
                                <p className="text-xs text-slate-500">
                                  {a.patient.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Stethoscope className="h-4 w-4 text-slate-400" />
                            Dr. {capitalize(a.dentist.lastName)}{" "}
                            {capitalize(a.dentist.firstName)}
                          </div>
                        </td>
                        <td className="py-4 text-slate-600">
                          {a.reason ? (
                            <span className="line-clamp-1">{a.reason}</span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-4">
                          <Badge
                            variant={statusVariant(a.status)}
                            pulse={a.status === "SCHEDULED"}
                          >
                            {statusLabel(a.status)}
                          </Badge>
                        </td>
                        <td className="py-4 pr-4 text-right">
                          <Link href={`/appointments/${a.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Pencil className="mr-1 h-4 w-4" />
                              Modifier
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {appointments.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-16 text-center">
                          <CalendarDays className="mx-auto h-12 w-12 text-slate-300" />
                          <p className="mt-3 text-sm font-medium text-slate-500">
                            Aucun rendez-vous pour cette date.
                          </p>
                          <Link href="/appointments/new">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="mt-4"
                            >
                              <CalendarPlus className="mr-2 h-4 w-4" />
                              Planifier un rendez-vous
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </FadeUp>
      </StaggerContainer>

      {dentists.length === 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Aucun dentiste actif dans ce cabinet. Les rendez-vous nécessitent un
          dentiste ou un propriétaire avec le rôle dentiste.
        </div>
      )}
    </PageWrapper>
  );
}
