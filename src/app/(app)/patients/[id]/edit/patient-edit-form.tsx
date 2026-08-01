"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updatePatient } from "../../actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  wilaya: string | null;
  notes: string | null;
}

interface Props {
  patient: Patient;
}

function toInputDate(date: Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function PatientEditForm({ patient }: Props) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setErrors({});

    const raw = Object.fromEntries(formData.entries());
    const res = await updatePatient(patient.id, raw);

    if (!res.ok) {
      setErrors(res.errors as Record<string, string[]>);
      setPending(false);
      return;
    }

    router.push(`/patients/${patient.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">
          Modifier le patient
        </h2>
        <Link href={`/patients/${patient.id}`}>
          <Button variant="secondary">Annuler</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="firstName"
                label="Prénom *"
                defaultValue={patient.firstName}
                error={errors.firstName?.[0]}
                required
              />
              <Input
                name="lastName"
                label="Nom *"
                defaultValue={patient.lastName}
                error={errors.lastName?.[0]}
                required
              />
            </div>
            <Input
              name="dateOfBirth"
              label="Date de naissance"
              type="date"
              defaultValue={toInputDate(patient.dateOfBirth)}
              error={errors.dateOfBirth?.[0]}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="phone"
                label="Téléphone"
                defaultValue={patient.phone ?? ""}
                error={errors.phone?.[0]}
              />
              <Input
                name="email"
                label="Email"
                type="email"
                defaultValue={patient.email ?? ""}
                error={errors.email?.[0]}
              />
            </div>
            <Input
              name="address"
              label="Adresse"
              defaultValue={patient.address ?? ""}
              error={errors.address?.[0]}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="city"
                label="Ville"
                defaultValue={patient.city ?? ""}
                error={errors.city?.[0]}
              />
              <Input
                name="wilaya"
                label="Wilaya"
                defaultValue={patient.wilaya ?? ""}
                error={errors.wilaya?.[0]}
              />
            </div>
            <TextArea
              name="notes"
              label="Notes"
              rows={3}
              defaultValue={patient.notes ?? ""}
            />

            {errors.global && (
              <p className="text-sm text-red-600">{errors.global[0]}</p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Link href={`/patients/${patient.id}`}>
                <Button type="button" variant="secondary">
                  Annuler
                </Button>
              </Link>
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
