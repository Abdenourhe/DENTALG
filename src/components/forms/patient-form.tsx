"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Patient } from "@prisma/client";

const bloodGroups = [
  { value: "", label: "Non renseigné" },
  { value: "A_POS", label: "A+" },
  { value: "A_NEG", label: "A-" },
  { value: "B_POS", label: "B+" },
  { value: "B_NEG", label: "B-" },
  { value: "AB_POS", label: "AB+" },
  { value: "AB_NEG", label: "AB-" },
  { value: "O_POS", label: "O+" },
  { value: "O_NEG", label: "O-" },
];

const generalConditions = [
  { value: "", label: "Non renseigné" },
  { value: "RAS", label: "RAS" },
  { value: "HYPERTENSION_ARTERIELLE", label: "Hypertension artérielle" },
  { value: "DIABETE", label: "Diabète" },
  { value: "INSUFFISANCE_CARDIAQUE", label: "Insuffisance cardiaque" },
  { value: "INFARCTUS_DU_MYOCARDE", label: "Infarctus du myocarde" },
  { value: "ENDOCARDITE", label: "Endocardite" },
  { value: "ASTHME", label: "Asthme" },
  { value: "TUBERCULOSE", label: "Tuberculose" },
  { value: "ALLERGIE", label: "Allergie" },
  { value: "INSUFFISANCE_RENALE_CHRONIQUE", label: "Insuffisance rénale chronique" },
  { value: "ANEMIES", label: "Anémies" },
  { value: "RETARD_PSYCHOMOTEUR", label: "Retard psychomoteur" },
  { value: "EPILEPSIE", label: "Épilepsie" },
  { value: "AUTRE", label: "Autre" },
];

interface PatientFormProps {
  action: (formData: FormData) => Promise<
    | { ok: true; patient: Patient }
    | { ok: false; errors: Record<string, string[]> & { global?: string[] } }
  >;
  initialData?: Partial<Patient>;
  submitLabel?: string;
}

function formatDateForInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0] ?? "";
}

export function PatientForm({ action, initialData, submitLabel = "Enregistrer" }: PatientFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[]> & { global?: string[] }>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setErrors({});

    const result = await action(formData);

    if (result.ok) {
      router.push(`/patients/${result.patient.id}`);
      router.refresh();
    } else {
      setErrors(result.errors);
      setPending(false);
    }
  }

  const field = (name: keyof Patient) => (initialData?.[name] as string | undefined) ?? "";

  return (
    <form action={handleSubmit} className="space-y-6">
      {errors.global && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {errors.global.join(", ")}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">Prénom *</Label>
          <Input id="firstName" name="firstName" defaultValue={field("firstName")} required />
          {errors.firstName && <p className="text-xs text-red-600">{errors.firstName[0]}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lastName">Nom *</Label>
          <Input id="lastName" name="lastName" defaultValue={field("lastName")} required />
          {errors.lastName && <p className="text-xs text-red-600">{errors.lastName[0]}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="nationalId">Numéro national d&apos;identité</Label>
          <Input id="nationalId" name="nationalId" defaultValue={field("nationalId")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dateOfBirth">Date de naissance</Label>
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            defaultValue={formatDateForInput(initialData?.dateOfBirth)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sex">Sexe</Label>
          <Select id="sex" name="sex" defaultValue={field("sex")}>
            <option value="">Non renseigné</option>
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bloodGroup">Groupe sanguin</Label>
          <Select id="bloodGroup" name="bloodGroup" defaultValue={field("bloodGroup")}>
            {bloodGroups.map((bg) => (
              <option key={bg.value} value={bg.value}>
                {bg.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="generalCondition">État général</Label>
          <Select id="generalCondition" name="generalCondition" defaultValue={field("generalCondition")}>
            {generalConditions.map((gc) => (
              <option key={gc.value} value={gc.value}>
                {gc.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" name="phone" type="tel" defaultValue={field("phone")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={field("email")} />
          {errors.email && <p className="text-xs text-red-600">{errors.email[0]}</p>}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="address">Adresse</Label>
          <Input id="address" name="address" defaultValue={field("address")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="city">Ville</Label>
          <Input id="city" name="city" defaultValue={field("city")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="wilaya">Wilaya</Label>
          <Input id="wilaya" name="wilaya" defaultValue={field("wilaya")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="emergencyContactName">Contact d&apos;urgence (nom)</Label>
          <Input id="emergencyContactName" name="emergencyContactName" defaultValue={field("emergencyContactName")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="emergencyContactPhone">Contact d&apos;urgence (téléphone)</Label>
          <Input id="emergencyContactPhone" name="emergencyContactPhone" type="tel" defaultValue={field("emergencyContactPhone")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="medicalHistory">Antécédents médicaux</Label>
        <Textarea id="medicalHistory" name="medicalHistory" defaultValue={field("medicalHistory")} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="allergies">Allergies</Label>
        <Textarea id="allergies" name="allergies" defaultValue={field("allergies")} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="currentMedications">Traitements en cours</Label>
        <Textarea id="currentMedications" name="currentMedications" defaultValue={field("currentMedications")} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" defaultValue={field("notes")} />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.push("/patients")}>
          Annuler
        </Button>
        <Button type="submit" isLoading={pending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
