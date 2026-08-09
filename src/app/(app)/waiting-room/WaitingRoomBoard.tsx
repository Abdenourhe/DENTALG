"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import WaitingRoomCard from "./WaitingRoomCard";
import CheckInDialog from "./CheckInDialog";
import PatientFileDrawer from "./PatientFileDrawer";
import {
  callPatient,
  completeVisit,
  markNoShow,
  notifyStaff,
  startConsultation,
  updatePriority,
} from "./actions";
import type {
  Appointment,
  Patient,
  User,
  WaitingRoomEntry,
  WaitingRoomPriority,
  WaitingRoomStatus,
} from "@prisma/client";
import {
  Calendar,
  Clock,
  Monitor,
  Plus,
  RefreshCw,
  UserPlus,
} from "lucide-react";
import Link from "next/link";

interface EntryWithRelations extends WaitingRoomEntry {
  patient: Patient;
  appointment: Appointment | null;
  dentist: Pick<User, "id" | "firstName" | "lastName"> | null;
  calledBy: Pick<User, "id" | "firstName" | "lastName"> | null;
  createdBy: Pick<User, "id" | "firstName" | "lastName"> | null;
}

interface WaitingRoomBoardProps {
  initialEntries: EntryWithRelations[];
  patients: Pick<Patient, "id" | "firstName" | "lastName" | "number">[];
  dentists: Pick<User, "id" | "firstName" | "lastName">[];
}

const columns: { status: WaitingRoomStatus; label: string }[] = [
  { status: "WAITING", label: "En attente" },
  { status: "CALLED", label: "Appelé" },
  { status: "IN_PROGRESS", label: "En consultation" },
  { status: "COMPLETED", label: "Terminé" },
];

const priorityOrder: Record<WaitingRoomPriority, number> = {
  HIGH: 0,
  NORMAL: 1,
  LOW: 2,
};

export default function WaitingRoomBoard({
  initialEntries,
  patients,
  dentists,
}: WaitingRoomBoardProps) {
  const [entries, setEntries] = useState<EntryWithRelations[]>(initialEntries);
  const [isPending, startTransition] = useTransition();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );
  const [checkInOpen, setCheckInOpen] = useState(false);

  function refreshEntries() {
    window.location.reload();
  }

  function updateEntryStatus(entryId: string, status: WaitingRoomStatus) {
    setEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, status } : e)),
    );
  }

  function handleCall(entryId: string) {
    startTransition(async () => {
      await callPatient(entryId);
      updateEntryStatus(entryId, "CALLED");
    });
  }

  function handleStart(entryId: string) {
    startTransition(async () => {
      await startConsultation(entryId);
      updateEntryStatus(entryId, "IN_PROGRESS");
    });
  }

  function handleComplete(entryId: string) {
    startTransition(async () => {
      await completeVisit(entryId);
      updateEntryStatus(entryId, "COMPLETED");
    });
  }

  function handleNoShow(entryId: string) {
    startTransition(async () => {
      await markNoShow(entryId);
      updateEntryStatus(entryId, "NO_SHOW");
    });
  }

  function handlePriority(entryId: string, priority: WaitingRoomPriority) {
    startTransition(async () => {
      await updatePriority(entryId, priority);
      setEntries((prev) =>
        prev.map((e) => (e.id === entryId ? { ...e, priority } : e)),
      );
    });
  }

  function handleNotify(entryId: string) {
    startTransition(async () => {
      await notifyStaff({ entryId, message: "" });
    });
  }

  function sortedEntries(status: WaitingRoomStatus) {
    return entries
      .filter((e) => e.status === status)
      .sort(
        (a, b) =>
          priorityOrder[a.priority] - priorityOrder[b.priority] ||
          new Date(a.arrivedAt).getTime() - new Date(b.arrivedAt).getTime(),
      );
  }

  const waitingCount = entries.filter((e) => e.status === "WAITING").length;
  const calledCount = entries.filter((e) => e.status === "CALLED").length;
  const inProgressCount = entries.filter(
    (e) => e.status === "IN_PROGRESS",
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Salle d’attente
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            <Calendar className="h-4 w-4" />
            {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/waiting-room/display" target="_blank">
            <Button variant="secondary" className="gap-2">
              <Monitor className="h-4 w-4" />
              Écran public
            </Button>
          </Link>
          <Button
            variant="secondary"
            className="gap-2"
            onClick={refreshEntries}
            disabled={isPending}
          >
            <RefreshCw className="h-4 w-4" />
            Rafraîchir
          </Button>
          <Button className="gap-2" onClick={() => setCheckInOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Arrivée
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-amber-50 p-3">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">En attente</p>
              <p className="text-2xl font-bold text-slate-900">
                {waitingCount}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-blue-50 p-3">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Appelés</p>
              <p className="text-2xl font-bold text-slate-900">{calledCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-violet-50 p-3">
              <Clock className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                En consultation
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {inProgressCount}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-emerald-50 p-3">
              <Clock className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total</p>
              <p className="text-2xl font-bold text-slate-900">
                {entries.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {columns.slice(0, 3).map((column) => (
          <Card key={column.status} className="flex flex-col">
            <CardHeader className="border-b px-4 py-3">
              <CardTitle className="flex items-center justify-between text-sm font-semibold">
                <span>{column.label}</span>
                <Badge variant="default">
                  {sortedEntries(column.status).length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-3 p-3">
              {sortedEntries(column.status).map((entry) => (
                <WaitingRoomCard
                  key={entry.id}
                  entry={entry}
                  onCall={handleCall}
                  onStart={handleStart}
                  onComplete={handleComplete}
                  onNoShow={handleNoShow}
                  onPriority={handlePriority}
                  onNotify={handleNotify}
                  onViewFile={setSelectedPatientId}
                  isPending={isPending}
                />
              ))}
              {sortedEntries(column.status).length === 0 && (
                <p className="py-8 text-center text-sm text-slate-400">
                  Aucun patient.
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {entries.some(
        (e) => e.status === "COMPLETED" || e.status === "NO_SHOW",
      ) && (
        <Card>
          <CardHeader className="border-b px-4 py-3">
            <CardTitle className="text-sm font-semibold">
              Terminés / Absents
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-3">
            {entries
              .filter((e) => e.status === "COMPLETED" || e.status === "NO_SHOW")
              .map((entry) => (
                <WaitingRoomCard
                  key={entry.id}
                  entry={entry}
                  onCall={handleCall}
                  onStart={handleStart}
                  onComplete={handleComplete}
                  onNoShow={handleNoShow}
                  onPriority={handlePriority}
                  onNotify={handleNotify}
                  onViewFile={setSelectedPatientId}
                  isPending={isPending}
                  compact
                />
              ))}
          </CardContent>
        </Card>
      )}

      <CheckInDialog
        open={checkInOpen}
        onClose={() => setCheckInOpen(false)}
        patients={patients}
        dentists={dentists}
      />

      <PatientFileDrawer
        patientId={selectedPatientId}
        onClose={() => setSelectedPatientId(null)}
      />
    </div>
  );
}
