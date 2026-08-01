"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPatient } from "../actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function NewPatientPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setErrors({});

    const data = Object.fromEntries(formData.entries());
    const res = await createPatient(data);

    if (!res.ok) {
      setErrors(res.errors as Record<string, string[]>);
      setPending(false);
      return;
    }

    router.push(`/patients/${res.patient.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Nouveau patient</h2>
      <Card>
        <CardContent className="pt-6">
          <form action={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="firstName"
                label="Prénom *"
                error={errors.firstName?.[0]}
                required
              />
              <Input
                name="lastName"
                label="Nom *"
                error={errors.lastName?.[0]}
                required
              />
            </div>
            <Input
              name="dateOfBirth"
              label="Date de naissance"
              type="date"
              error={errors.dateOfBirth?.[0]}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="phone"
                label="Téléphone"
                error={errors.phone?.[0]}
              />
              <Input
                name="email"
                label="Email"
                type="email"
                error={errors.email?.[0]}
              />
            </div>
            <Input name="address" label="Adresse" error={errors.address?.[0]} />
            <div className="grid grid-cols-2 gap-4">
              <Input name="city" label="Ville" error={errors.city?.[0]} />
              <Input name="wilaya" label="Wilaya" error={errors.wilaya?.[0]} />
            </div>
            <TextArea name="notes" label="Notes" rows={3} />

            {errors.global && (
              <p className="text-sm text-red-600">{errors.global[0]}</p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/patients")}
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
