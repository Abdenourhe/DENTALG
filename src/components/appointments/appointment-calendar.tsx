"use client";

import { useState } from "react";
import Link from "next/link";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  formatDayNumber,
  formatMonthYear,
  formatShortDate,
  formatShortTime,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "@/lib/date";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

interface CalendarAppointment {
  id: string;
  startAt: Date;
  endAt: Date;
  status: string;
  patient: { firstName: string; lastName: string };
  dentist: { firstName: string; lastName: string };
}

interface AppointmentCalendarProps {
  appointments: CalendarAppointment[];
}

const statusVariant: Record<string, "default" | "success" | "warning" | "danger"> = {
  SCHEDULED: "default",
  CONFIRMED: "success",
  CANCELLED: "danger",
  NO_SHOW: "warning",
  COMPLETED: "success",
};

const statusLabel: Record<string, string> = {
  SCHEDULED: "Planifié",
  CONFIRMED: "Confirmé",
  CANCELLED: "Annulé",
  NO_SHOW: "Absent",
  COMPLETED: "Terminé",
};

export function AppointmentCalendar({ appointments }: AppointmentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = new Date(calendarStart);
  while (day <= calendarEnd) {
    days.push(new Date(day));
    day = addDays(day, 1);
  }

  const selectedAppointments = selectedDate
    ? appointments.filter((a) => isSameDay(new Date(a.startAt), selectedDate))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold capitalize text-slate-900">
            {formatMonthYear(currentMonth)}
          </h2>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
            >
              Aujourd&apos;hui
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Link href="/appointments/new">
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Nouveau RDV
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500">
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
                <div key={d} className="py-2">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((d) => {
                const dayAppointments = appointments.filter((a) =>
                  isSameDay(new Date(a.startAt), d),
                );
                const isSelected = selectedDate ? isSameDay(d, selectedDate) : false;
                const isCurrentMonth = isSameMonth(d, currentMonth);

                return (
                  <button
                    key={d.toISOString()}
                    type="button"
                    onClick={() => setSelectedDate(d)}
                    className={`relative min-h-[80px] rounded-lg border p-1 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary-50"
                        : "border-slate-100 hover:border-primary-200"
                    } ${!isCurrentMonth ? "bg-slate-50/50 text-slate-400" : "bg-white"}`}
                  >
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-sm ${
                        isSameDay(d, new Date())
                          ? "bg-primary font-semibold text-white"
                          : "text-slate-700"
                      }`}
                    >
                      {formatDayNumber(d)}
                    </span>
                    {dayAppointments.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {dayAppointments.slice(0, 2).map((a) => (
                          <div
                            key={a.id}
                            className="truncate rounded px-1 py-0.5 text-[10px] font-medium bg-primary-100 text-primary-800"
                          >
                            {formatShortTime(new Date(a.startAt))} {a.patient.lastName}
                          </div>
                        ))}
                        {dayAppointments.length > 2 && (
                          <div className="text-[10px] text-slate-500">
                            +{dayAppointments.length - 2}
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="mb-4 font-semibold text-slate-900">
              {selectedDate
                ? `Rendez-vous du ${formatShortDate(selectedDate)}`
                : "Sélectionnez une date"}
            </h3>
            {selectedAppointments.length === 0 ? (
              <p className="text-sm text-slate-500">
                {selectedDate ? "Aucun rendez-vous ce jour." : "Cliquez sur un jour pour voir les rendez-vous."}
              </p>
            ) : (
              <div className="space-y-3">
                {selectedAppointments.map((a) => (
                  <Link
                    key={a.id}
                    href={`/appointments/${a.id}`}
                    className="block rounded-lg border border-slate-200 p-3 transition-colors hover:border-primary-200 hover:bg-slate-50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900">
                        {formatShortTime(new Date(a.startAt))} -{" "}
                        {formatShortTime(new Date(a.endAt))}
                      </span>
                      <Badge variant={statusVariant[a.status] ?? "default"}>
                        {statusLabel[a.status] ?? a.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-700">
                      {a.patient.firstName} {a.patient.lastName}
                    </p>
                    <p className="text-xs text-slate-500">
                      Dr. {a.dentist.firstName} {a.dentist.lastName}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
