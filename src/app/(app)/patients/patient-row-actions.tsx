"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { archivePatient, restorePatient, deletePatient } from "./actions";
import { Archive, Trash2, RotateCcw } from "lucide-react";

interface Props {
  patientId: string;
  isActive: boolean;
}

export default function PatientRowActions({ patientId, isActive }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState<
    "archive" | "delete" | "restore" | null
  >(null);

  async function handleArchive() {
    if (
      !window.confirm(
        "Archiver ce patient ?\n\nIl ne sera plus visible dans la liste active, mais vous pourrez le réactiver depuis la vue 'Patients archivés'.",
      )
    )
      return;
    setPending("archive");
    const res = await archivePatient(patientId);
    setPending(null);
    if (!res.ok) {
      alert(res.errors?.global?.[0] ?? "Erreur lors de l'archivage.");
      return;
    }
    router.refresh();
  }

  async function handleRestore() {
    if (
      !window.confirm(
        "Réactiver ce patient ?\n\nIl réapparaîtra dans la liste active.",
      )
    )
      return;
    setPending("restore");
    const res = await restorePatient(patientId);
    setPending(null);
    if (!res.ok) {
      alert(res.errors?.global?.[0] ?? "Erreur lors de la réactivation.");
      return;
    }
    router.refresh();
  }

  async function handleDelete() {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir supprimer ce patient ?\n\nCette action est définitive en logique (suppression logique). Les données médicales restent conservées pour la conformité, mais le patient n'apparaîtra plus dans la liste.",
      )
    )
      return;
    setPending("delete");
    const res = await deletePatient(patientId);
    setPending(null);
    if (!res.ok) {
      alert(res.errors?.global?.[0] ?? "Erreur lors de la suppression.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {isActive ? (
        <button
          type="button"
          onClick={handleArchive}
          disabled={pending === "archive"}
          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-amber-600 disabled:opacity-50"
          title="Archiver"
        >
          <Archive className="h-4 w-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleRestore}
          disabled={pending === "restore"}
          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-green-600 disabled:opacity-50"
          title="Réactiver"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      )}
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending === "delete"}
        className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-red-600 disabled:opacity-50"
        title="Supprimer définitivement (logique)"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
