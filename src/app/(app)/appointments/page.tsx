import Link from "next/link";
import { listAppointments, getDentists } from "./actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatDate } from "@/lib/date";

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const appointments = await listAppointments(date);
  const dentists = await getDentists();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Rendez-vous</h2>
        <Link href="/appointments/new">
          <Button>Nouveau RDV</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-4">
          <form className="mb-4 flex items-center gap-3">
            <input
              name="date"
              type="date"
              defaultValue={date ?? new Date().toISOString().slice(0, 10)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <Button type="submit" variant="secondary">
              Filtrer
            </Button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="pb-2 font-medium">Heure</th>
                  <th className="pb-2 font-medium">Patient</th>
                  <th className="pb-2 font-medium">Dentiste</th>
                  <th className="pb-2 font-medium">Motif</th>
                  <th className="pb-2 font-medium">Statut</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="py-3 whitespace-nowrap">
                      {formatDateTime(a.startAt)}
                    </td>
                    <td className="py-3 font-medium text-slate-900">
                      {a.patient.lastName} {a.patient.firstName}
                    </td>
                    <td className="py-3 text-slate-600">
                      Dr. {a.dentist.lastName}
                    </td>
                    <td className="py-3 text-slate-600">
                      {a.reason ?? "—"}
                    </td>
                    <td className="py-3">
                      <Badge
                        variant={
                          a.status === "COMPLETED"
                            ? "success"
                            : a.status === "CANCELLED"
                            ? "danger"
                            : a.status === "CONFIRMED"
                            ? "info"
                            : "default"
                        }
                      >
                        {a.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/appointments/${a.id}`}
                        className="text-sm font-medium text-slate-900 hover:underline"
                      >
                        Détails
                      </Link>
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Aucun rendez-vous pour cette date.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
