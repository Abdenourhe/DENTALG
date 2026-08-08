import Link from "next/link";
import { notFound } from "next/navigation";
import { getAppointment, deleteAppointment } from "@/lib/actions/appointments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime } from "@/lib/date";
import { Calendar, Clock, User, Stethoscope, FileText, ArrowLeft, Trash2 } from "lucide-react";

interface AppointmentDetailPageProps {
  params: Promise<{ id: string }>;
}

const statusLabels: Record<string, string> = {
  SCHEDULED: "Planifié",
  CONFIRMED: "Confirmé",
  CANCELLED: "Annulé",
  NO_SHOW: "Absent",
  COMPLETED: "Terminé",
};

export default async function AppointmentDetailPage({ params }: AppointmentDetailPageProps) {
  const { id } = await params;
  const appointment = await getAppointment(id);
  if (!appointment) notFound();

  async function handleDelete() {
    "use server";
    await deleteAppointment(id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/appointments">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Rendez-vous du {formatDate(appointment.startAt)}
            </h1>
            <p className="text-slate-500">
              {formatDateTime(appointment.startAt)} - {formatDateTime(appointment.endAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <form action={handleDelete}>
            <Button type="submit" variant="danger" size="sm">
              <Trash2 className="mr-1.5 h-4 w-4" />
              Supprimer
            </Button>
          </form>
          <Link href={`/appointments/${id}/edit`}>
            <Button variant="secondary" size="sm">Modifier</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <InfoItem icon={User} label="Patient" value={`${appointment.patient.firstName} ${appointment.patient.lastName}`} />
            <InfoItem icon={Stethoscope} label="Dentiste" value={`Dr. ${appointment.dentist.firstName} ${appointment.dentist.lastName}`} />
            <InfoItem icon={Calendar} label="Date" value={formatDate(appointment.startAt)} />
            <InfoItem icon={Clock} label="Horaire" value={`${formatDateTime(appointment.startAt)} - ${formatDateTime(appointment.endAt)}`} />
            <InfoItem icon={FileText} label="Motif" value={appointment.reason} />
            <InfoItem icon={FileText} label="Notes" value={appointment.notes} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statut</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant={
                appointment.status === "CANCELLED"
                  ? "danger"
                  : appointment.status === "COMPLETED" || appointment.status === "CONFIRMED"
                    ? "success"
                    : appointment.status === "NO_SHOW"
                      ? "warning"
                      : "default"
              }
            >
              {statusLabels[appointment.status] ?? appointment.status}
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 text-slate-400" />
      <div>
        <dt className="text-xs font-medium uppercase text-slate-500">{label}</dt>
        <dd className="text-sm text-slate-900">{value || "—"}</dd>
      </div>
    </div>
  );
}
