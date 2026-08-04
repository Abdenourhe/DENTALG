"use client";

import { useState, useCallback } from "react";

export type ToothSurface = "O" | "M" | "D" | "B" | "L";
export type ToothStatus =
  | "HEALTHY"
  | "CARIES"
  | "TREATED"
  | "MISSING"
  | "CROWN"
  | "IMPLANT"
  | "ROOT_CANAL"
  | "EXTRACTION_PLANNED"
  | "FRACTURE"
  | "ABCESS";

export interface ToothSurfaceState {
  surface: ToothSurface;
  status: ToothStatus;
}

export interface ToothState {
  tooth: number;
  surfaces: ToothSurfaceState[];
  notes?: string;
}

const STATUS_COLORS: Record<ToothStatus, string> = {
  HEALTHY: "#22c55e",
  CARIES: "#ef4444",
  TREATED: "#f59e0b",
  MISSING: "#1e293b",
  CROWN: "#a855f7",
  IMPLANT: "#3b82f6",
  ROOT_CANAL: "#06b6d4",
  EXTRACTION_PLANNED: "#f97316",
  FRACTURE: "#ec4899",
  ABCESS: "#dc2626",
};

const STATUS_LABELS: Record<ToothStatus, string> = {
  HEALTHY: "Saine",
  CARIES: "Carie",
  TREATED: "Traitée",
  MISSING: "Manquante",
  CROWN: "Couronne",
  IMPLANT: "Implant",
  ROOT_CANAL: "Traitement radiculaire",
  EXTRACTION_PLANNED: "Extraction prévue",
  FRACTURE: "Fracture",
  ABCESS: "Abcès",
};

const ALL_STATUSES: ToothStatus[] = [
  "HEALTHY",
  "CARIES",
  "TREATED",
  "MISSING",
  "CROWN",
  "IMPLANT",
  "ROOT_CANAL",
  "EXTRACTION_PLANNED",
  "FRACTURE",
  "ABCESS",
];

const SURFACE_LABELS: Record<ToothSurface, string> = {
  O: "Occlusale",
  M: "Mésiale",
  D: "Distale",
  B: "Buccale",
  L: "Linguale",
};

const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];
const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];

function ToothSVG({
  tooth,
  surfaces,
  isSelected,
  onSelect,
  onSurfaceClick,
  readOnly = false,
}: {
  tooth: number;
  surfaces: ToothSurfaceState[];
  isSelected: boolean;
  onSelect: (tooth: number) => void;
  onSurfaceClick?: (tooth: number, surface: ToothSurface) => void;
  readOnly?: boolean;
}) {
  const getColor = (surface: ToothSurface) => {
    const s = surfaces.find((x) => x.surface === surface);
    return s ? STATUS_COLORS[s.status] : STATUS_COLORS.HEALTHY;
  };

  const handleSurfaceClick = (surface: ToothSurface) => {
    if (readOnly) return;
    onSurfaceClick?.(tooth, surface);
  };

  return (
    <div
      className={`relative flex flex-col items-center gap-1 ${
        isSelected ? "scale-110" : ""
      } transition-transform`}
    >
      <svg
        viewBox="0 0 40 50"
        className="h-12 w-10 cursor-pointer"
        onClick={() => onSelect(tooth)}
      >
        {/* Buccale (haut) */}
        <path
          d="M8,2 L32,2 L28,16 L12,16 Z"
          fill={getColor("B")}
          stroke={isSelected ? "#3b82f6" : "#fff"}
          strokeWidth={isSelected ? 2 : 1}
          onClick={(e) => {
            e.stopPropagation();
            handleSurfaceClick("B");
          }}
          className={readOnly ? "" : "hover:opacity-80"}
        />
        {/* Linguale (bas) */}
        <path
          d="M12,34 L28,34 L32,48 L8,48 Z"
          fill={getColor("L")}
          stroke={isSelected ? "#3b82f6" : "#fff"}
          strokeWidth={isSelected ? 2 : 1}
          onClick={(e) => {
            e.stopPropagation();
            handleSurfaceClick("L");
          }}
          className={readOnly ? "" : "hover:opacity-80"}
        />
        {/* Mésiale (gauche) */}
        <path
          d="M2,8 L12,16 L12,34 L2,42 Z"
          fill={getColor("M")}
          stroke={isSelected ? "#3b82f6" : "#fff"}
          strokeWidth={isSelected ? 2 : 1}
          onClick={(e) => {
            e.stopPropagation();
            handleSurfaceClick("M");
          }}
          className={readOnly ? "" : "hover:opacity-80"}
        />
        {/* Distale (droite) */}
        <path
          d="M38,8 L28,16 L28,34 L38,42 Z"
          fill={getColor("D")}
          stroke={isSelected ? "#3b82f6" : "#fff"}
          strokeWidth={isSelected ? 2 : 1}
          onClick={(e) => {
            e.stopPropagation();
            handleSurfaceClick("D");
          }}
          className={readOnly ? "" : "hover:opacity-80"}
        />
        {/* Occlusale (centre) */}
        <path
          d="M12,16 L28,16 L28,34 L12,34 Z"
          fill={getColor("O")}
          stroke={isSelected ? "#3b82f6" : "#fff"}
          strokeWidth={isSelected ? 2 : 1}
          onClick={(e) => {
            e.stopPropagation();
            handleSurfaceClick("O");
          }}
          className={readOnly ? "" : "hover:opacity-80"}
        />
      </svg>
      <span
        className={`text-[10px] font-semibold ${
          isSelected ? "text-primary" : "text-slate-500"
        }`}
      >
        {tooth}
      </span>
    </div>
  );
}

interface InteractiveOdontogramProps {
  initialTeeth?: ToothState[];
  onChange?: (teeth: ToothState[]) => void;
  readOnly?: boolean;
  compact?: boolean;
}

export default function InteractiveOdontogram({
  initialTeeth = [],
  onChange,
  readOnly = false,
  compact = false,
}: InteractiveOdontogramProps) {
  const [teeth, setTeeth] = useState<ToothState[]>(initialTeeth);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [activeStatus, setActiveStatus] = useState<ToothStatus>("HEALTHY");

  const getTooth = useCallback(
    (n: number) => teeth.find((t) => t.tooth === n),
    [teeth]
  );

  const updateSurface = useCallback(
    (toothNum: number, surface: ToothSurface) => {
      if (readOnly) return;

      setTeeth((prev) => {
        const existing = prev.find((t) => t.tooth === toothNum);
        let next: ToothState[];

        if (!existing) {
          next = [
            ...prev,
            { tooth: toothNum, surfaces: [{ surface, status: activeStatus }] },
          ];
        } else {
          const surfaces = existing.surfaces.filter((s) => s.surface !== surface);
          if (
            !existing.surfaces.find(
              (s) => s.surface === surface && s.status === activeStatus
            )
          ) {
            surfaces.push({ surface, status: activeStatus });
          }
          next = prev.map((t) =>
            t.tooth === toothNum ? { ...t, surfaces } : t
          );
        }

        onChange?.(next);
        return next;
      });
    },
    [readOnly, activeStatus, onChange]
  );

  const allTeethNumbers = [
    ...UPPER_RIGHT,
    ...UPPER_LEFT,
    ...LOWER_LEFT,
    ...LOWER_RIGHT,
  ];

  const ToothRow = ({ teethNumbers }: { teethNumbers: number[] }) => (
    <div className="flex justify-center gap-1">
      {teethNumbers.map((n) => (
        <ToothSVG
          key={n}
          tooth={n}
          surfaces={getTooth(n)?.surfaces ?? []}
          isSelected={selectedTooth === n}
          onSelect={setSelectedTooth}
          onSurfaceClick={updateSurface}
          readOnly={readOnly}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {!readOnly && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500">
              Outil actif :
            </span>
            {ALL_STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setActiveStatus(status)}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                  activeStatus === status
                    ? "bg-white shadow ring-1 ring-slate-200"
                    : "hover:bg-white/50"
                }`}
              >
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[status] }}
                />
                {STATUS_LABELS[status]}
              </button>
            ))}
          </div>
          {selectedTooth && (
            <div className="mt-2 border-t border-slate-200 pt-2 text-xs text-slate-500">
              Dent {selectedTooth} sélectionnée — cliquez sur une surface pour
              appliquer &quot;{STATUS_LABELS[activeStatus]}&quot;
            </div>
          )}
        </div>
      )}

      {/* Odontogram */}
      <div className="space-y-2">
        <ToothRow teethNumbers={UPPER_RIGHT} />
        <ToothRow teethNumbers={UPPER_LEFT} />

        {/* Spacer / divider */}
        <div className="py-1" />

        <ToothRow teethNumbers={LOWER_LEFT} />
        <ToothRow teethNumbers={LOWER_RIGHT} />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 text-[10px] text-slate-600">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <span key={status} className="flex items-center gap-1">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            {STATUS_LABELS[status as ToothStatus]}
          </span>
        ))}
      </div>
    </div>
  );
}
