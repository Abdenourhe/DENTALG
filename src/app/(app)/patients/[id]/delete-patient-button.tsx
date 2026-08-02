"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePatient } from "../actions";
import { Button } from "@/components/ui/button";

interface Props {
  patientId: string;
}

export default function DeletePatientButton({ patientId }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setPending(true);
    const res = await deletePatient(patientId);
    setPending(false);

    if (!res.ok) {
      alert(
        "Impossible de supprimer le patient : " +
          (res.errors?.global?.[0] ?? "erreur inconnue."),
      );
      setConfirming(false);
      return;
    }

    router.push("/patients");
  }

  return (
    <Button
      type="button"
      variant="danger"
      isLoading={pending}
      onClick={handleClick}
    >
      {confirming ? "Confirmer la suppression" : "Supprimer"}
    </Button>
  );
}
