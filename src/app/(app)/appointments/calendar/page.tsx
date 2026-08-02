import { listAppointmentsRange, getDentists } from "../actions";
import CalendarView from "./calendar-view";

interface Props {
  searchParams: Promise<{ date?: string; view?: string }>;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export default async function CalendarPage({ searchParams }: Props) {
  const { date, view } = await searchParams;
  const initialDate = date ? new Date(date) : new Date();
  const initialView = view === "day" ? "day" : "week";

  const weekStart = startOfWeek(initialDate);
  const weekEnd = addDays(weekStart, 6);

  const [appointments, dentists] = await Promise.all([
    listAppointmentsRange(
      weekStart.toISOString().slice(0, 10),
      weekEnd.toISOString().slice(0, 10),
    ),
    getDentists(),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Calendrier des rendez-vous
        </h2>
        <p className="text-sm text-slate-500">
          Vue semaine et jour avec détection des conflits.
        </p>
      </div>
      <CalendarView
        appointments={appointments.map((a) => ({
          ...a,
          status: a.status as
            "SCHEDULED" | "CONFIRMED" | "CANCELLED" | "NO_SHOW" | "COMPLETED",
        }))}
        dentists={dentists}
        initialDate={initialDate}
        initialView={initialView}
      />
    </div>
  );
}
