"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
  AlertTriangle,
  Move,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { moveAppointment } from "../actions";

interface Appointment {
  id: string;
  patientId: string;
  patient: { firstName: string; lastName: string; phone: string | null };
  dentistId: string;
  dentist: { firstName: string; lastName: string };
  startAt: Date;
  endAt: Date;
  reason: string | null;
  status: "SCHEDULED" | "CONFIRMED" | "CANCELLED" | "NO_SHOW" | "COMPLETED";
}

interface Dentist {
  id: string;
  firstName: string;
  lastName: string;
}

interface Props {
  appointments: Appointment[];
  dentists: Dentist[];
  initialDate: Date;
  initialView?: "week" | "day";
}

const START_HOUR = 8;
const END_HOUR = 20;
const HOURS = Array.from(
  { length: END_HOUR - START_HOUR },
  (_, i) => START_HOUR + i,
);
const PX_PER_HOUR = 64;
const PX_PER_MINUTE = PX_PER_HOUR / 60;
const SNAP_MINUTES = 15;

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

function capitalize(value: string): string {
  return value
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function dentistColor(dentistId: string, dentists: Dentist[]): string {
  const colors = [
    "bg-blue-100 text-blue-800 border-blue-200",
    "bg-green-100 text-green-800 border-green-200",
    "bg-amber-100 text-amber-800 border-amber-200",
    "bg-purple-100 text-purple-800 border-purple-200",
    "bg-pink-100 text-pink-800 border-pink-200",
    "bg-cyan-100 text-cyan-800 border-cyan-200",
  ];
  const index = dentists.findIndex((d) => d.id === dentistId);
  return colors[index % colors.length] || colors[0];
}

function snapMinutes(minutes: number): number {
  return Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES;
}

export default function CalendarView({
  appointments,
  dentists,
  initialDate,
  initialView = "week",
}: Props) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [view, setView] = useState<"week" | "day">(initialView);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [dragOverDay, setDragOverDay] = useState<Date | null>(null);

  const weekStart = useMemo(() => startOfWeek(currentDate), [currentDate]);
  const days = useMemo(() => {
    const count = view === "week" ? 7 : 1;
    const start = view === "week" ? weekStart : new Date(currentDate);
    if (view === "day") start.setHours(0, 0, 0, 0);
    return Array.from({ length: count }, (_, i) => addDays(start, i));
  }, [currentDate, view, weekStart]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const start = new Date(a.startAt);
      return days.some((d) => isSameDay(d, start));
    });
  }, [appointments, days]);

  const groupedByDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const day of days) {
      const key = day.toISOString().slice(0, 10);
      map.set(
        key,
        filteredAppointments.filter((a) => isSameDay(new Date(a.startAt), day)),
      );
    }
    return map;
  }, [filteredAppointments, days]);

  function navigate(amount: number) {
    const d = addDays(currentDate, view === "week" ? amount * 7 : amount);
    setCurrentDate(d);
    updateQuery(d, view);
  }

  function goToToday() {
    const d = new Date();
    setCurrentDate(d);
    updateQuery(d, view);
  }

  function switchView(next: "week" | "day") {
    setView(next);
    updateQuery(currentDate, next);
  }

  function updateQuery(date: Date, v: "week" | "day") {
    const params = new URLSearchParams();
    params.set("date", date.toISOString().slice(0, 10));
    if (v !== "week") params.set("view", v);
    router.push(`/appointments/calendar?${params.toString()}`, {
      scroll: false,
    });
  }

  function slotHref(day: Date, hour: number): string {
    const d = new Date(day);
    d.setHours(hour, 0, 0, 0);
    return `/appointments/new?date=${encodeURIComponent(d.toISOString())}`;
  }

  function handleDragStart(e: React.DragEvent, appointment: Appointment) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    setDraggedId(appointment.id);
    setDragOffsetY(offsetY);
    setError(null);
    e.dataTransfer.effectAllowed = "move";
    // Hide default ghost image isn't possible, but we can set a custom drag image if desired
  }

  function handleDragEnd() {
    setDraggedId(null);
    setDragOverDay(null);
  }

  function handleDragOver(e: React.DragEvent, day: Date) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverDay(day);
  }

  function handleDrop(e: React.DragEvent, day: Date) {
    e.preventDefault();
    setDragOverDay(null);
    if (!draggedId) return;

    const column = e.currentTarget as HTMLElement;
    const rect = column.getBoundingClientRect();
    const y = e.clientY - rect.top - dragOffsetY;
    const rawMinutes = START_HOUR * 60 + y / PX_PER_MINUTE;
    const minutes = Math.max(
      START_HOUR * 60,
      Math.min(END_HOUR * 60 - 1, snapMinutes(rawMinutes)),
    );

    const newStart = new Date(day);
    newStart.setHours(0, minutes, 0, 0);

    const appointment = appointments.find((a) => a.id === draggedId);
    if (!appointment) return;

    startTransition(async () => {
      const res = await moveAppointment(draggedId, newStart.toISOString());
      if (!res.ok) {
        setError(
          res.errors?.global?.[0] ?? "Impossible de déplacer le rendez-vous.",
        );
      } else {
        setError(null);
        router.refresh();
      }
      setDraggedId(null);
    });
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={goToToday}>
            Aujourd&apos;hui
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h3 className="ml-2 text-lg font-semibold text-slate-900">
            {view === "week"
              ? `Semaine du ${formatDateShort(weekStart)}`
              : currentDate.toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => switchView("week")}
              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                view === "week"
                  ? "bg-primary text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Semaine
            </button>
            <button
              type="button"
              onClick={() => switchView("day")}
              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                view === "day"
                  ? "bg-primary text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Jour
            </button>
          </div>
          <Link href="/appointments">
            <Button variant="secondary" size="sm">
              <List className="mr-2 h-4 w-4" />
              Liste
            </Button>
          </Link>
          <Link href="/appointments/new">
            <Button size="sm">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Nouveau RDV
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {/* Header row */}
        <div
          className="grid border-b border-slate-200 bg-slate-50"
          style={{
            gridTemplateColumns: `60px repeat(${days.length}, minmax(0, 1fr))`,
          }}
        >
          <div className="border-r border-slate-200 p-2 text-xs font-medium text-slate-500" />
          {days.map((day) => {
            const isToday = isSameDay(day, today);
            return (
              <div
                key={day.toISOString()}
                className={`p-2 text-center ${isToday ? "bg-primary-50" : ""}`}
              >
                <p
                  className={`text-xs font-medium ${isToday ? "text-primary" : "text-slate-500"}`}
                >
                  {day.toLocaleDateString("fr-FR", { weekday: "short" })}
                </p>
                <p
                  className={`text-lg font-semibold ${isToday ? "text-primary" : "text-slate-900"}`}
                >
                  {day.getDate()}
                </p>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div
          className="relative grid"
          style={{
            gridTemplateColumns: `60px repeat(${days.length}, minmax(0, 1fr))`,
            height: `${HOURS.length * PX_PER_HOUR}px`,
          }}
        >
          {/* Hour labels */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="absolute left-0 flex h-16 w-[60px] items-start justify-end border-r border-slate-200 pr-2 pt-2 text-xs font-medium text-slate-500"
              style={{ top: `${(hour - START_HOUR) * PX_PER_HOUR}px` }}
            >
              {String(hour).padStart(2, "0")}:00
            </div>
          ))}

          {/* Horizontal grid lines */}
          {HOURS.map((hour) => (
            <div
              key={`line-${hour}`}
              className="absolute left-[60px] right-0 border-b border-slate-100"
              style={{ top: `${(hour - START_HOUR + 1) * PX_PER_HOUR}px` }}
            />
          ))}

          {/* Day columns */}
          {days.map((day, dayIndex) => {
            const dayKey = day.toISOString().slice(0, 10);
            const dayAppointments = groupedByDay.get(dayKey) || [];
            const isDropTarget = dragOverDay && isSameDay(day, dragOverDay);

            return (
              <div
                key={dayKey}
                className={`relative h-full border-r border-slate-100 last:border-r-0 ${
                  isDropTarget ? "bg-primary-50/50" : ""
                }`}
                style={{ gridColumn: `${dayIndex + 2}` }}
                onDragOver={(e) => handleDragOver(e, day)}
                onDrop={(e) => handleDrop(e, day)}
              >
                {/* Clickable slots */}
                {HOURS.map((hour) => (
                  <Link
                    key={`slot-${hour}`}
                    href={slotHref(day, hour)}
                    className="absolute left-0 right-0 block hover:bg-slate-50"
                    style={{
                      top: `${(hour - START_HOUR) * PX_PER_HOUR}px`,
                      height: `${PX_PER_HOUR}px`,
                    }}
                    onDragOver={(e) => e.preventDefault()}
                  />
                ))}

                {/* Appointments */}
                {dayAppointments.map((a) => {
                  const start = new Date(a.startAt);
                  const end = new Date(a.endAt);
                  const startMin = minutesSinceMidnight(start);
                  const endMin = minutesSinceMidnight(end);
                  const top = (startMin - START_HOUR * 60) * PX_PER_MINUTE;
                  const height = (endMin - startMin) * PX_PER_MINUTE;
                  const hasConflict = dayAppointments.some(
                    (other) =>
                      other.id !== a.id &&
                      other.dentistId === a.dentistId &&
                      new Date(other.startAt) < end &&
                      new Date(other.endAt) > start,
                  );
                  const isDragging = draggedId === a.id;

                  return (
                    <Link
                      key={a.id}
                      href={`/appointments/${a.id}/edit`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, a)}
                      onDragEnd={handleDragEnd}
                      className={`absolute left-1 right-1 overflow-hidden rounded-md border px-2 py-1 text-xs shadow-sm transition-shadow hover:shadow-md ${dentistColor(a.dentistId, dentists)} ${
                        hasConflict ? "ring-2 ring-red-400" : ""
                      } ${isDragging ? "opacity-60" : ""} ${
                        isPending ? "cursor-wait" : "cursor-move"
                      }`}
                      style={{
                        top: `${top}px`,
                        height: `${Math.max(height, 24)}px`,
                        minHeight: "24px",
                      }}
                      title={`Glissez pour déplacer — ${capitalize(a.patient.lastName)} ${capitalize(a.patient.firstName)} — Dr. ${capitalize(a.dentist.lastName)}`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="truncate font-medium">
                          {capitalize(a.patient.lastName)}{" "}
                          {capitalize(a.patient.firstName)}
                        </span>
                        {hasConflict && (
                          <AlertTriangle className="h-3 w-3 shrink-0 text-red-600" />
                        )}
                        {!hasConflict && (
                          <Move className="h-3 w-3 shrink-0 opacity-50" />
                        )}
                      </div>
                      <div className="truncate text-[10px] opacity-90">
                        Dr. {capitalize(a.dentist.lastName)} ·{" "}
                        {formatTime(start)}-{formatTime(end)}
                      </div>
                      {a.reason && (
                        <div className="truncate text-[10px] opacity-80">
                          {a.reason}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-primary" />
          <span>Aujourd&apos;hui</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm border border-red-400 ring-2 ring-red-400" />
          <span>Conflit de créneau (même dentiste)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Move className="h-3 w-3" />
          <span>Glisser-déposer pour déplacer</span>
        </div>
        {dentists.map((d) => (
          <div key={d.id} className="flex items-center gap-1.5">
            <span
              className={`inline-block h-3 w-3 rounded-sm border ${dentistColor(d.id, dentists)}`}
            />
            <span>Dr. {capitalize(d.lastName)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
