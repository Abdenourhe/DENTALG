"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPatient, listDentists, listRooms } from "../actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TextArea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DoorOpen, UserPlus, CheckCircle2 } from "lucide-react";

interface DentistOption {
  id: string;
  firstName: string;
  lastName: string;
}

interface RoomOption {
  id: string;
  name: string;
}

export default function NewPatientPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [addToWaitingRoom, setAddToWaitingRoom] = useState(false);
  const [dentists, setDentists] = useState<DentistOption[]>([]);
  const [rooms, setRooms] = useState<RoomOption[]>([]);

  useEffect(() => {
    listDentists().then(setDentists);
    listRooms().then(setRooms);
  }, []);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setErrors({});
    setSuccess(null);

    const data = Object.fromEntries(formData.entries());
    const res = await createPatient(data);

    if (!res.ok) {
      setErrors(res.errors as Record<string, string[]>);
      setPending(false);
      return;
    }

    if (res.entry) {
      setSuccess(
        `${res.patient.firstName} ${res.patient.lastName} a été ajouté à la salle d’attente.`,
      );
      setTimeout(() => {
        router.push("/waiting-room");
      }, 600);
      return;
    }

    router.push(`/patients/${res.patient.id}`);
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Nouveau patient</h2>
        {success && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            {success}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Identité */}
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Input
                  name="nationalId"
                  label="N° carte nationale d'identité"
                  placeholder="Ex : 12345678901234567890"
                  error={errors.nationalId?.[0]}
                />
                <Select
                  name="sex"
                  label="Sexe"
                  defaultValue=""
                  placeholder="Choisir..."
                  options={[
                    { value: "M", label: "Masculin" },
                    { value: "F", label: "Féminin" },
                  ]}
                />
                <Select
                  name="bloodGroup"
                  label="Groupe sanguin"
                  defaultValue=""
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
                error={errors.dateOfBirth?.[0]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Coordonnées */}
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
                  error={errors.phone?.[0]}
                />
                <Input
                  name="email"
                  label="Email"
                  type="email"
                  error={errors.email?.[0]}
                />
              </div>
              <Input
                name="address"
                label="Adresse"
                error={errors.address?.[0]}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input name="city" label="Ville" error={errors.city?.[0]} />
                <Input
                  name="wilaya"
                  label="Wilaya"
                  error={errors.wilaya?.[0]}
                />
              </div>

              <div className="border-t pt-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Contact d&apos;urgence
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input
                    name="emergencyContactName"
                    placeholder="Nom et prénom"
                    error={errors.emergencyContactName?.[0]}
                  />
                  <Input
                    name="emergencyContactPhone"
                    placeholder="Téléphone"
                    error={errors.emergencyContactPhone?.[0]}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations médicales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations médicales</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Select
                name="generalCondition"
                label="État général"
                defaultValue=""
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
                  {
                    value: "RETARD_PSYCHOMOTEUR",
                    label: "Retard psychomoteur",
                  },
                  { value: "EPILEPSIE", label: "Épilepsie" },
                  { value: "AUTRE", label: "Autre" },
                ]}
              />
              <TextArea
                name="medicalHistory"
                label="Antécédents médicaux"
                rows={3}
                placeholder="Maladies chroniques, chirurgies, antécédents familiaux..."
              />
              <TextArea
                name="currentMedications"
                label="Médicaments en cours"
                rows={2}
                placeholder="Traitements réguliers..."
              />
              <TextArea name="notes" label="Notes libres" rows={2} />
            </div>
          </CardContent>
        </Card>

        {/* Salle d'attente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <DoorOpen className="h-5 w-5 text-violet-600" />
                Salle d&apos;attente
              </span>
              <Switch
                name="addToWaitingRoom"
                label="Ajouter directement"
                checked={addToWaitingRoom}
                onCheckedChange={setAddToWaitingRoom}
              />
            </CardTitle>
          </CardHeader>
          {addToWaitingRoom && (
            <CardContent className="pt-0">
              <div className="space-y-4">
                <Input
                  name="waitingRoomReason"
                  label="Motif de visite"
                  placeholder="Ex : douleur, contrôle, extraction..."
                  error={errors.waitingRoomReason?.[0]}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Select
                    name="waitingRoomPriority"
                    label="Priorité"
                    defaultValue="NORMAL"
                    options={[
                      { value: "LOW", label: "Basse" },
                      { value: "NORMAL", label: "Normale" },
                      { value: "HIGH", label: "Haute" },
                    ]}
                  />
                  <Select
                    name="waitingRoomDentistId"
                    label="Dentiste"
                    defaultValue=""
                    placeholder="Choisir..."
                    options={[
                      { value: "", label: "— Aucun —" },
                      ...dentists.map((d) => ({
                        value: d.id,
                        label: `Dr ${d.lastName} ${d.firstName}`,
                      })),
                    ]}
                  />
                  <Select
                    name="waitingRoomRoomId"
                    label="Salle"
                    defaultValue=""
                    placeholder={
                      rooms.length ? "Choisir..." : "Aucune salle active"
                    }
                    disabled={rooms.length === 0}
                    options={[
                      { value: "", label: "— Aucune —" },
                      ...rooms.map((r) => ({
                        value: r.id,
                        label: r.name,
                      })),
                    ]}
                  />
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {errors.global && (
        <p className="text-sm text-red-600">{errors.global[0]}</p>
      )}

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/patients")}
        >
          Annuler
        </Button>
        <Button type="submit" isLoading={pending} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
