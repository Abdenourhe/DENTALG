"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Appointment, Patient, User } from "@prisma/client";

const statusLabels: Record<string, string> = {
  SCHEDULED: "Planifié",
  CONFIRMED: "Confirmé",
  CANCELLED: "Annulé",
  NO_SHOW: "Absent",
  COMPLETED: "Terminé",
};

interface AppointmentFormProps {
  action: (formData: FormData) => Promise<
    | { ok: true; appointment: Appointment }
    | { ok: false; errors: Record<string, string[]> & { global?: string[] } }
  >;
  patients: Pick<Patient, "id" | "firstName" | "lastName">[];
  dentists: Pick<User, "id" | "firstName" | "lastName">[];
  initialData?: Partial<Appointment> & { date?: string; startTime?: string; endTime?: string };
  submitLabel?: string;
}

function formatTimeForInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(11, 16);
}

function formatDateForInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}

export function AppointmentForm({
  action,
  patients,
  dentists,
  initialData,
  submitLabel = "Enregistrer",
}: AppointmentFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[]> & { global?: string[] }>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setErrors({});

    const result = await action(formData);

    if (result.ok) {
      router.push("/rendez-vous");
      router.refresh();
    } else {
      setErrors(result.errors);
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {errors.global && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {errors.global.join(", ")}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="patientId">Patient *</Label>
          <Select id="patientId" name="patientId" defaultValue={initialData?.patientId} required>
            <option value="">Sélectionner un patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName}
              </option>
            ))}
          </Select>
          {errors.patientId && <p className="text-xs text-red-600">{errors.patientId[0]}</p>}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="dentistId">Dentiste *</Label>
          <Select id="dentistId" name="dentistId" defaultValue={initialData?.dentistId} required>
            <option value="">Sélectionner un dentiste</option>
            {dentists.map((d) => (
              <option key={d.id} value={d.id}>
                Dr. {d.firstName} {d.lastName}
              </option>
            ))}
          </Select>
          {errors.dentistId && <p className="text-xs text-red-600">{errors.dentistId[0]}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={initialData?.date ?? formatDateForInput(initialData?.startAt)}
            required
          />
          {errors.date && <p className="text-xs text-red-600">{errors.date[0]}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="status">Statut</Label>
          <Select id="status" name="status" defaultValue={initialData?.status ?? "SCHEDULED"}>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="startTime">Heure de début *</Label>
          <Input
            id="startTime"
            name="startTime"
            type="time"
            defaultValue={initialData?.startTime ?? formatTimeForInput(initialData?.startAt)}
            required
          />
          {errors.startTime && <p className="text-xs text-red-600">{errors.startTime[0]}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="endTime">Heure de fin *</Label>
          <Input
            id="endTime"
            name="endTime"
            type="time"
            defaultValue={initialData?.endTime ?? formatTimeForInput(initialData?.endAt)}
            required
          />
          {errors.endTime && <p className="text-xs text-red-600">{errors.endTime[0]}</p>}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="reason">Motif</Label>
          <Input
            id="reason"
            name="reason"
            defaultValue={initialData?.reason ?? ""}
            placeholder="Consultation, contrôle, etc."
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" defaultValue={initialData?.notes ?? ""} />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.push("/rendez-vous")}>
          Annuler
        </Button>
        <Button type="submit" isLoading={pending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
