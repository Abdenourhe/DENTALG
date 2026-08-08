"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { archivePatient, deletePatient } from "@/lib/actions/patients";
import { Archive, ArchiveRestore, Trash2 } from "lucide-react";

interface PatientActionsProps {
  patientId: string;
  isActive: boolean;
  variant?: "row" | "detail";
}

export function PatientActions({ patientId, isActive, variant = "row" }: PatientActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  const size = variant === "row" ? "sm" : "md";

  function handleArchive() {
    startTransition(async () => {
      await archivePatient(patientId, !isActive);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement ce patient ?")) {
      return;
    }
    setIsDeleting(true);
    startTransition(async () => {
      await deletePatient(patientId);
      router.push("/patients");
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size={size}
        isLoading={isPending}
        onClick={handleArchive}
        title={isActive ? "Archiver" : "Désarchiver"}
      >
        {isActive ? (
          <>
            <Archive className="mr-1.5 h-4 w-4" />
            {variant === "detail" && "Archiver"}
          </>
        ) : (
          <>
            <ArchiveRestore className="mr-1.5 h-4 w-4" />
            {variant === "detail" && "Désarchiver"}
          </>
        )}
      </Button>

      <Button
        type="button"
        variant="danger"
        size={size}
        isLoading={isDeleting}
        onClick={handleDelete}
        title="Supprimer"
      >
        <Trash2 className="mr-1.5 h-4 w-4" />
        {variant === "detail" && "Supprimer"}
      </Button>
    </div>
  );
}
