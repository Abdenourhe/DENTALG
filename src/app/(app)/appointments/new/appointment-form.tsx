"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function AppointmentForm({
  patients,
  dentists,
  defaultPatientId,
}: Props) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);

  const patientOptions = patients.map((p) => ({
    value: p.id,
    label: `${p.lastName} ${p.firstName} (N° ${p.number})`,
  }));

  const dentistOptions = dentists.map((d) => ({
    value: d.id,
    label: `Dr. ${d.lastName} ${d.firstName}`,
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

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Nouveau rendez-vous</h2>
      <Card>
        <CardContent className="pt-6">
          <form action={handleSubmit} className="space-y-4">
            <Select
              name="patientId"
              label="Patient *"
              required
              defaultValue={defaultPatientId || ""}
              placeholder="Choisir un patient..."
              options={patientOptions}
              error={errors.patientId?.[0]}
            />
            <Select
              name="dentistId"
              label="Dentiste *"
              required
              placeholder="Choisir un dentiste..."
              options={dentistOptions}
              error={errors.dentistId?.[0]}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="startAt"
                label="Début *"
                type="datetime-local"
                required
                error={errors.startAt?.[0]}
              />
              <Input
                name="endAt"
                label="Fin *"
                type="datetime-local"
                required
                error={errors.endAt?.[0]}
              />
            </div>
            <Input name="reason" label="Motif" error={errors.reason?.[0]} />
            <TextArea name="notes" label="Notes" rows={3} />

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
                Enregistrer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
