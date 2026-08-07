"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updatePatient } from "../../actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TextArea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string | null;
  sex: string | null;
  bloodGroup: string | null;
  generalCondition: string | null;
  dateOfBirth: Date | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  wilaya: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  medicalHistory: string | null;
  allergies: string | null;
  currentMedications: string | null;
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
    <form action={handleSubmit} className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">
          Modifier le patient
        </h2>
        <Link href={`/patients/${patient.id}`}>
          <Button variant="secondary">Annuler</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Identité</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                name="nationalId"
                label="N° carte nationale d'identité"
                defaultValue={patient.nationalId ?? ""}
                placeholder="Ex : 12345678901234567890"
                error={errors.nationalId?.[0]}
              />
              <Select
                name="sex"
                label="Sexe"
                defaultValue={patient.sex ?? ""}
                placeholder="Choisir..."
                options={[
                  { value: "M", label: "Masculin" },
                  { value: "F", label: "Féminin" },
                ]}
              />
              <Select
                name="bloodGroup"
                label="Groupe sanguin"
                defaultValue={patient.bloodGroup ?? ""}
                placeholder="Choisir..."
                options={[
                  { value: "A+", label: "A+" },
                  { value: "A-", label: "A-" },
                  { value: "B+", label: "B+" },
                  { value: "B-", label: "B-" },
                  { value: "AB+", label: "AB+" },
                  { value: "AB-", label: "AB-" },
                  { value: "O+", label: "O+" },
                  { value: "O-", label: "O-" },
                ]}
              />
            </div>

            <Input
              name="dateOfBirth"
              label="Date de naissance"
              type="date"
              defaultValue={toInputDate(patient.dateOfBirth)}
              error={errors.dateOfBirth?.[0]}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coordonnées</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personne à contacter en cas d&apos;urgence</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              name="emergencyContactName"
              label="Nom et prénom"
              defaultValue={patient.emergencyContactName ?? ""}
              error={errors.emergencyContactName?.[0]}
            />
            <Input
              name="emergencyContactPhone"
              label="Téléphone"
              defaultValue={patient.emergencyContactPhone ?? ""}
              error={errors.emergencyContactPhone?.[0]}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informations médicales</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Select
              name="generalCondition"
              label="État général"
              defaultValue={patient.generalCondition ?? ""}
              placeholder="Choisir..."
              options={[
                { value: "", label: "Choisir..." },
                { value: "RAS", label: "RAS" },
                {
                  value: "HYPERTENSION_ARTERIELLE",
                  label: "Hypertension artérielle",
                },
                { value: "DIABETE", label: "Diabète" },
                {
                  value: "INSUFFISANCE_CARDIAQUE",
                  label: "Insuffisance cardiaque",
                },
                {
                  value: "INFARCTUS_DU_MYOCARDE",
                  label: "Infarctus du myocarde",
                },
                { value: "ENDOCARDITE", label: "Endocardite" },
                { value: "ASTHME", label: "Asthme" },
                { value: "TUBERCULOSE", label: "Tuberculose" },
                { value: "ALLERGIE", label: "Allergie" },
                {
                  value: "INSUFFISANCE_RENALE_CHRONIQUE",
                  label: "Insuffisance rénale chronique",
                },
                { value: "ANEMIES", label: "Anémies" },
                { value: "RETARD_PSYCHOMOTEUR", label: "Retard psychomoteur" },
                { value: "EPILEPSIE", label: "Épilepsie" },
                { value: "AUTRE", label: "Autre" },
              ]}
            />
            <TextArea
              name="medicalHistory"
              label="Antécédents médicaux"
              rows={3}
              defaultValue={patient.medicalHistory ?? ""}
              placeholder="Maladies chroniques, chirurgies, antécédents familiaux..."
            />
            <TextArea
              name="allergies"
              label="Allergies"
              rows={2}
              defaultValue={patient.allergies ?? ""}
              placeholder="Médicaments, aliments, produits..."
            />
            <TextArea
              name="currentMedications"
              label="Médicaments en cours"
              rows={2}
              defaultValue={patient.currentMedications ?? ""}
              placeholder="Traitements réguliers..."
            />
            <TextArea
              name="notes"
              label="Notes libres"
              rows={3}
              defaultValue={patient.notes ?? ""}
            />
          </div>
        </CardContent>
      </Card>

      {errors.global && (
        <p className="text-sm text-red-600">{errors.global[0]}</p>
      )}

      <div className="flex justify-end gap-3">
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
  );
}
