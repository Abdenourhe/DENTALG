"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function SuperAdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("SuperAdmin error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="rounded-full bg-red-100 p-4">
        <AlertTriangle className="h-8 w-8 text-red-600" />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-slate-900">
        Erreur lors du chargement du tableau de bord
      </h2>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        Une erreur serveur est survenue. Cela peut être dû à une migration de
        base de données en attente ou à des données incohérentes.
      </p>
      {error.digest && (
        <p className="mt-1 text-xs text-slate-400">Digest: {error.digest}</p>
      )}
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Réessayer</Button>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Actualiser
        </Button>
      </div>
    </div>
  );
}
