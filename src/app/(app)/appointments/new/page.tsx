"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAppointment } from "../actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function NewAppointmentPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);

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
            <Input name="patientId" label="ID Patient *" required error={errors.patientId?.[0]} />
            <Input name="dentistId" label="ID Dentiste *" required error={errors.dentistId?.[0]} />
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
