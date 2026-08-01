"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  ArrowLeft,
  Save,
} from "lucide-react";
import { createAppointment } from "../actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TextArea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface PatientOption {
  id: string;
  firstName: string;
  lastName: string;
  number: string;
  phone: string | null;
}

interface DentistOption {
  id: string;
  firstName: string;
  lastName: string;
}

interface Props {
  patients: PatientOption[];
  dentists: DentistOption[];
  defaultPatientId?: string;
}

function toDateTimeLocalInput(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function addMinutes(date: Date, minutes: number): Date {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + minutes);
  return d;
}

function capitalize(value: string): string {
  return value
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export default function AppointmentForm({
  patients,
  dentists,
  defaultPatientId,
}: Props) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(
    defaultPatientId || "",
  );
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  useEffect(() => {
    if (!startAt) {
      const now = new Date();
      now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
      setStartAt(toDateTimeLocalInput(now));
      setEndAt(toDateTimeLocalInput(addMinutes(now, 30)));
    }
  }, [startAt]);

  const patientOptions = patients.map((p) => ({
    value: p.id,
    label: `${capitalize(p.lastName)} ${capitalize(p.firstName)} (N° ${p.number})`,
  }));

  const dentistOptions = dentists.map((d) => ({
    value: d.id,
    label: `Dr. ${capitalize(d.lastName)} ${capitalize(d.firstName)}`,
  }));

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setErrors({});

    const data = Object.fromEntries(formData.entries());
    const res = await createAppointment(data);

    if (!res.ok) {
      setErrors(res.errors as Record<string, string[]>);
      setPending(false);
      return;
    }

    router.push("/appointments");
  }

  function handleStartChange(value: string) {
    setStartAt(value);
    if (value) {
      setEndAt(toDateTimeLocalInput(addMinutes(new Date(value), 30)));
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.push("/appointments")}
          className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Retour aux rendez-vous
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Nouveau rendez-vous
        </h2>
        <p className="text-sm text-slate-500">
          Planifiez un rendez-vous pour un patient avec un dentiste.
        </p>
      </div>

      {selectedPatient && (
        <div className="flex items-start gap-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <User className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">
              {capitalize(selectedPatient.lastName)}{" "}
              {capitalize(selectedPatient.firstName)}
            </p>
            <p className="text-sm text-slate-600">
              Dossier n° {selectedPatient.number}
              {selectedPatient.phone && ` — ${selectedPatient.phone}`}
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <form action={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <User className="h-4 w-4 text-slate-500" /> Patient *
                </label>
                <Select
                  name="patientId"
                  required
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  placeholder="Choisir un patient..."
                  options={patientOptions}
                  error={errors.patientId?.[0]}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Stethoscope className="h-4 w-4 text-slate-500" /> Dentiste *
                </label>
                <Select
                  name="dentistId"
                  required
                  placeholder="Choisir un dentiste..."
                  options={dentistOptions}
                  error={errors.dentistId?.[0]}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Calendar className="h-4 w-4 text-slate-500" /> Début *
                </label>
                <Input
                  name="startAt"
                  type="datetime-local"
                  required
                  value={startAt}
                  onChange={(e) => handleStartChange(e.target.value)}
                  error={errors.startAt?.[0]}
                  className="text-slate-900"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Clock className="h-4 w-4 text-slate-500" /> Fin *
                </label>
                <Input
                  name="endAt"
                  type="datetime-local"
                  required
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  error={errors.endAt?.[0]}
                  className="text-slate-900"
                />
              </div>
            </div>

            <Input
              name="reason"
              label="Motif"
              placeholder="Consultation, contrôle, soin..."
              error={errors.reason?.[0]}
            />
            <TextArea
              name="notes"
              label="Notes"
              rows={3}
              placeholder="Informations complémentaires..."
            />

            {errors.global && (
              <p className="text-sm text-red-600">{errors.global[0]}</p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/appointments")}
              >
                Annuler
              </Button>
              <Button type="submit" isLoading={pending}>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
