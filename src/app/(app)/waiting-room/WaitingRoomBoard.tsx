"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import WaitingRoomCard from "./WaitingRoomCard";
import CheckInDialog from "./CheckInDialog";
import PatientFileDrawer from "./PatientFileDrawer";
import {
  assignRoom,
  callPatient,
  completeVisit,
  listWaitingRoom,
  markNoShow,
  notifyStaff,
  startConsultation,
  updatePriority,
} from "./actions";
import type {
  Appointment,
  Patient,
  Room,
  User,
  WaitingRoomEntry,
  WaitingRoomPriority,
  WaitingRoomStatus,
} from "@prisma/client";
import {
  Calendar,
  Clock,
  DoorOpen,
  Monitor,
  Plus,
  RefreshCw,
  UserPlus,
  Volume2,
} from "lucide-react";
import Link from "next/link";

interface EntryWithRelations extends WaitingRoomEntry {
  patient: Patient;
  appointment: Appointment | null;
  room: Pick<Room, "id" | "name"> | null;
  dentist: Pick<User, "id" | "firstName" | "lastName"> | null;
  calledBy: Pick<User, "id" | "firstName" | "lastName"> | null;
  createdBy: Pick<User, "id" | "firstName" | "lastName"> | null;
}

interface WaitingRoomBoardProps {
  initialEntries: EntryWithRelations[];
  patients: Pick<
    Patient,
    "id" | "firstName" | "lastName" | "arabicName" | "number"
  >[];
  dentists: Pick<User, "id" | "firstName" | "lastName">[];
  rooms: Pick<Room, "id" | "name">[];
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

type SoundType = "ding" | "chime" | "bell";

let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  const AudioCtx =
    typeof window !== "undefined" &&
    (window.AudioContext ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitAudioContext);
  if (!AudioCtx) return null;
  if (!sharedAudioContext || sharedAudioContext.state === "closed") {
    sharedAudioContext = new AudioCtx();
  }
  return sharedAudioContext;
}

async function playNotificationSound(type: SoundType = "ding") {
  try {
    const audioCtx = getAudioContext();
    if (!audioCtx) return;

    if (audioCtx.state === "suspended") {
      await audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    gainNode.gain.setValueAtTime(0.3, now);

    switch (type) {
      case "ding":
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(880, now);
        oscillator.frequency.exponentialRampToValueAtTime(440, now + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
        break;
      case "chime":
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(523.25, now);
        oscillator.frequency.setValueAtTime(659.25, now + 0.1);
        oscillator.frequency.setValueAtTime(783.99, now + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        oscillator.start(now);
        oscillator.stop(now + 0.6);
        break;
      case "bell":
        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(523.25, now);
        gainNode.gain.setValueAtTime(0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        oscillator.start(now);
        oscillator.stop(now + 0.8);
        break;
    }
  } catch {
    // Son non supporté — ignorer silencieusement.
  }
}

export default function WaitingRoomBoard({
  initialEntries,
  patients,
  dentists,
  rooms,
}: WaitingRoomBoardProps) {
  const [entries, setEntries] = useState<EntryWithRelations[]>(initialEntries);
  const [isPending, startTransition] = useTransition();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundType, setSoundType] = useState<SoundType>("ding");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const previousEntriesRef = useRef<EntryWithRelations[]>(initialEntries);

  useEffect(() => {
    const stored = localStorage.getItem("dentalg_waiting_room_sound");
    const storedType = localStorage.getItem("dentalg_waiting_room_sound_type");
    setSoundEnabled(stored === "true");
    setSoundType((storedType as SoundType) || "ding");
  }, []);

  async function refreshEntriesFromServer() {
    startTransition(async () => {
      const fresh = await listWaitingRoom();
      const previousMap = new Map(
        previousEntriesRef.current.map((e) => [e.id, e]),
      );
      const hasNewEntry = fresh.some((e) => !previousMap.has(e.id));
      const hasNewlyCalled = fresh.some(
        (e) =>
          e.status === "CALLED" &&
          (!previousMap.has(e.id) ||
            previousMap.get(e.id)?.status !== "CALLED"),
      );

      setEntries(fresh as EntryWithRelations[]);
      setLastUpdated(new Date());
      previousEntriesRef.current = fresh as EntryWithRelations[];

      if (soundEnabled && (hasNewEntry || hasNewlyCalled)) {
        playNotificationSound(soundType);
      }
    });
  }

  useEffect(() => {
    refreshEntriesFromServer();

    let eventSource: EventSource | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    function connect() {
      if (eventSource) {
        try {
          eventSource.close();
        } catch {
          // ignore
        }
      }

      eventSource = new EventSource("/api/waiting-room/stream");

      eventSource.addEventListener("connected", () => {
        // Connexion établie — rien à faire, le heartbeat garde la connexion ouverte.
      });

      eventSource.addEventListener("update", () => {
        refreshEntriesFromServer();
      });

      eventSource.addEventListener("error", () => {
        // La connexion a été coupée : reconnexion après un court délai.
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
        reconnectTimeout = setTimeout(connect, 3000);
      });
    }

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) {
        eventSource.onerror = null;
        eventSource.close();
      }
    };
  }, [soundEnabled, soundType]);

  async function toggleSound(enabled: boolean) {
    setSoundEnabled(enabled);
    localStorage.setItem("dentalg_waiting_room_sound", String(enabled));
    if (enabled) {
      // Réveille l’AudioContext (nécessite un geste utilisateur) et joue un son test.
      await playNotificationSound(soundType);
    }
  }

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

  function handleAssignRoom(entryId: string, roomId: string) {
    startTransition(async () => {
      await assignRoom(entryId, roomId);
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryId
            ? {
                ...e,
                roomId: roomId || null,
                room: rooms.find((r) => r.id === roomId) || null,
              }
            : e,
        ),
      );
    });
  }

  function sortedEntries(status: WaitingRoomStatus, excludeId?: string) {
    return entries
      .filter((e) => e.status === status && e.id !== excludeId)
      .sort(
        (a, b) =>
          priorityOrder[a.priority] - priorityOrder[b.priority] ||
          new Date(a.arrivedAt).getTime() - new Date(b.arrivedAt).getTime(),
      );
  }

  function sortedCalledEntries() {
    return entries
      .filter((e) => e.status === "CALLED")
      .sort(
        (a, b) =>
          new Date(b.calledAt ?? b.arrivedAt).getTime() -
          new Date(a.calledAt ?? a.arrivedAt).getTime(),
      );
  }

  const waitingCount = entries.filter((e) => e.status === "WAITING").length;
  const calledCount = entries.filter((e) => e.status === "CALLED").length;
  const inProgressCount = entries.filter(
    (e) => e.status === "IN_PROGRESS",
  ).length;

  const calledEntries = sortedCalledEntries();
  const latestCalled = calledEntries[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Salle d’attente
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
            </span>
            <span className="flex items-center gap-2">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  isPending ? "bg-amber-400" : "bg-emerald-500"
                }`}
              />
              Mis à jour à {format(lastUpdated, "HH:mm:ss", { locale: fr })}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Switch
            label="Son"
            checked={soundEnabled}
            onCheckedChange={toggleSound}
          />
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

      {latestCalled && (
        <Card className="overflow-hidden border-2 border-blue-500/30 bg-gradient-to-r from-blue-50 to-white">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <Volume2 className="h-7 w-7 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                    Patient appelé
                  </p>
                  <h2 className="mt-1 text-3xl font-bold text-slate-900">
                    {latestCalled.patient.lastName}{" "}
                    {latestCalled.patient.firstName}
                  </h2>
                  {latestCalled.patient.arabicName && (
                    <p className="text-lg font-medium text-slate-600" dir="rtl">
                      {latestCalled.patient.arabicName}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock className="h-4 w-4" />
                  Appelé à{" "}
                  {format(
                    new Date(latestCalled.calledAt ?? latestCalled.arrivedAt),
                    "HH:mm",
                    { locale: fr },
                  )}
                </div>
                {latestCalled.room && (
                  <Badge variant="default" className="gap-1">
                    <DoorOpen className="h-3 w-3" />
                    {latestCalled.room.name}
                  </Badge>
                )}
                {latestCalled.dentist && (
                  <p className="text-sm text-slate-600">
                    Dr. {latestCalled.dentist.lastName}{" "}
                    {latestCalled.dentist.firstName}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {columns.slice(0, 3).map((column) => {
          const columnEntries = sortedEntries(
            column.status,
            column.status === "CALLED" && latestCalled
              ? latestCalled.id
              : undefined,
          );
          return (
            <Card key={column.status} className="flex flex-col">
              <CardHeader className="border-b px-4 py-3">
                <CardTitle className="flex items-center justify-between text-sm font-semibold">
                  <span>{column.label}</span>
                  <Badge variant="default">{columnEntries.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-3 p-3">
                {columnEntries.map((entry, idx) => (
                  <WaitingRoomCard
                    key={entry.id}
                    entry={entry}
                    rooms={rooms}
                    onCall={handleCall}
                    onStart={handleStart}
                    onComplete={handleComplete}
                    onNoShow={handleNoShow}
                    onPriority={handlePriority}
                    onNotify={handleNotify}
                    onViewFile={setSelectedPatientId}
                    onAssignRoom={handleAssignRoom}
                    isPending={isPending}
                    index={column.status === "WAITING" ? idx : undefined}
                    isNext={column.status === "WAITING" && idx === 0}
                  />
                ))}
                {columnEntries.length === 0 && (
                  <p className="py-8 text-center text-sm text-slate-400">
                    Aucun patient.
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
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
                  rooms={rooms}
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
        rooms={rooms}
      />

      <PatientFileDrawer
        patientId={selectedPatientId}
        onClose={() => setSelectedPatientId(null)}
      />
    </div>
  );
}
