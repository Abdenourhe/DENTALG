"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { checkInPatient } from "./actions";
import type { Patient, User } from "@prisma/client";
import { ScanBarcode, UserPlus } from "lucide-react";

interface CheckInDialogProps {
  open: boolean;
  onClose: () => void;
  patients: Pick<Patient, "id" | "firstName" | "lastName" | "number">[];
  dentists: Pick<User, "id" | "firstName" | "lastName">[];
}

export default function CheckInDialog({
  open,
  onClose,
  patients,
  dentists,
}: CheckInDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [barcode, setBarcode] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);

  function findPatientByBarcode(value: string) {
    return patients.find((p) => p.number === value.trim());
  }

  function handleBarcodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    const patient = findPatientByBarcode(barcode);
    if (patient) {
      submitCheckIn({
        patientId: patient.id,
        arrivalType: "WALK_IN",
        priority: "NORMAL",
      });
    } else {
      setErrors({ barcode: ["Aucun patient trouvé avec ce code."] });
    }
  }

  function submitCheckIn(data: Record<string, string>) {
    startTransition(async () => {
      const result = await checkInPatient(data);
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }
      setBarcode("");
      setErrors(null);
      onClose();
      window.location.reload();
    });
  }

  function handleManualSubmit(formData: FormData) {
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });
    submitCheckIn(data);
  }

  return (
    <Modal isOpen={open} onClose={onClose} title="Enregistrer une arrivée">
      <p className="text-sm text-slate-500">
        Scannez le code-barre du patient ou sélectionnez-le manuellement.
      </p>
      <div className="space-y-5">
        <form onSubmit={handleBarcodeSubmit} className="space-y-3">
          <Input
            label="Code-barre / N° dossier"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Scanner ou saisir le numéro"
            icon={<ScanBarcode className="h-4 w-4" />}
            error={errors?.barcode?.[0]}
          />
          <Button
            type="submit"
            variant="secondary"
            className="w-full gap-2"
            disabled={isPending || !barcode.trim()}
          >
            <ScanBarcode className="h-4 w-4" />
            Rechercher par code-barre
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-2 text-xs text-slate-500">ou</span>
          </div>
        </div>

        <form action={handleManualSubmit} className="space-y-4">
          <Select
            name="patientId"
            label="Patient"
            required
            options={patients.map((p) => ({
              value: p.id,
              label: `${p.lastName} ${p.firstName} — N° ${p.number}`,
            }))}
            error={errors?.patientId?.[0]}
          />
          <Select
            name="dentistId"
            label="Dentiste (optionnel)"
            options={[
              { value: "", label: "— Aucun —" },
              ...dentists.map((d) => ({
                value: d.id,
                label: `Dr. ${d.lastName} ${d.firstName}`,
              })),
            ]}
            error={errors?.dentistId?.[0]}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              name="priority"
              label="Priorité"
              defaultValue="NORMAL"
              options={[
                { value: "LOW", label: "Non urgent" },
                { value: "NORMAL", label: "Normal" },
                { value: "HIGH", label: "Prioritaire" },
              ]}
            />
            <Select
              name="arrivalType"
              label="Type d'arrivée"
              defaultValue="WALK_IN"
              options={[
                { value: "WALK_IN", label: "Sans rendez-vous" },
                { value: "APPOINTMENT", label: "Avec rendez-vous" },
              ]}
            />
          </div>
          <Input
            name="notes"
            label="Notes (optionnel)"
            placeholder="Motif, remarque…"
          />
          {errors?.global && (
            <p className="text-sm text-red-600">{errors.global[0]}</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Enregistrer l&apos;arrivée
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
