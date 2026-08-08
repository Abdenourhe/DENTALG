"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function SuperAdminErrorFallback({ error }: { error?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
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
      {error && (
        <p className="mt-3 max-w-md rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          {error}
        </p>
      )}
      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-800"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </button>
      </div>
    </div>
  );
}
