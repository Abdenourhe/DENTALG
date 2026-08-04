"use client";

import { useState, useTransition } from "react";
import InteractiveOdontogram, {
  type ToothState,
  type ToothSurface,
  type ToothStatus,
} from "@/components/dental/InteractiveOdontogram";
import { upsertToothStatus } from "../actions";

interface ToothStatusDb {
  id: string;
  tooth: number;
  status: string;
  surfaces: Record<string, string> | null;
  notes: string | null;
}

interface OdontogramWrapperProps {
  patientId: string;
  toothStatuses: ToothStatusDb[];
}

function dbToComponentState(statuses: ToothStatusDb[]): ToothState[] {
  return statuses.map((ts) => ({
    tooth: ts.tooth,
    surfaces: ts.surfaces
      ? Object.entries(ts.surfaces).map(([surface, status]) => ({
          surface: surface as ToothSurface,
          status: status as ToothStatus,
        }))
      : [{ surface: "O" as ToothSurface, status: ts.status as ToothStatus }],
    notes: ts.notes ?? undefined,
  }));
}

export default function OdontogramWrapper({
  patientId,
  toothStatuses,
}: OdontogramWrapperProps) {
  const [teeth, setTeeth] = useState<ToothState[]>(
    dbToComponentState(toothStatuses)
  );
  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleChange = (nextTeeth: ToothState[]) => {
    setTeeth(nextTeeth);
    setSaveError(null);

    // Find the tooth that changed (compare with previous state)
    const prevMap = new Map(teeth.map((t) => [t.tooth, t]));
    const changed = nextTeeth.find((next) => {
      const prev = prevMap.get(next.tooth);
      if (!prev) return true;
      const nextSorted = [...next.surfaces].sort((a, b) =>
        a.surface.localeCompare(b.surface)
      );
      const prevSorted = [...prev.surfaces].sort((a, b) =>
        a.surface.localeCompare(b.surface)
      );
      return JSON.stringify(nextSorted) !== JSON.stringify(prevSorted);
    });

    if (!changed) return;

    // Compute overall status from surfaces (most severe wins)
    const surfacesRecord: Record<string, string> = {};
    for (const s of changed.surfaces) {
      surfacesRecord[s.surface] = s.status;
    }

    const severityOrder: ToothStatus[] = [
      "HEALTHY",
      "TREATED",
      "CROWN",
      "IMPLANT",
      "ROOT_CANAL",
      "EXTRACTION_PLANNED",
      "FRACTURE",
      "ABCESS",
      "CARIES",
      "MISSING",
    ];

    const allStatuses = changed.surfaces.map((s) => s.status);
    let overallStatus: ToothStatus = "HEALTHY";
    for (const sev of severityOrder) {
      if (allStatuses.includes(sev)) {
        overallStatus = sev;
        break;
      }
    }

    startTransition(async () => {
      const result = await upsertToothStatus({
        patientId,
        tooth: changed.tooth,
        status: overallStatus,
        surfaces: surfacesRecord,
      });
      if (!result.ok) {
        setSaveError("Erreur lors de la sauvegarde du statut dentaire.");
        console.error("upsertToothStatus failed", result);
      }
    });
  };

  return (
    <div className={isPending ? "opacity-70" : ""}>
      {saveError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {saveError}
        </div>
      )}
      <InteractiveOdontogram initialTeeth={teeth} onChange={handleChange} />
    </div>
  );
}
