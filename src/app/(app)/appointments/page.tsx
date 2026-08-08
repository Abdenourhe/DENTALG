import { listAppointments } from "@/lib/actions/appointments";
import { listPatients } from "@/lib/actions/patients";
import { getClinicUsers } from "@/lib/actions/users";
import { AppointmentCalendar } from "@/components/appointments/appointment-calendar";

export default async function AppointmentsPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [appointments, patients, dentists] = await Promise.all([
    listAppointments({ from: startOfMonth, to: endOfMonth }),
    listPatients(),
    getClinicUsers({ role: "DENTIST" }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Rendez-vous</h1>
        <p className="text-slate-500">Planifiez et suivez les consultations.</p>
      </div>

      <AppointmentCalendar appointments={appointments} />
    </div>
  );
}
