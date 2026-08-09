"use client";

import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import type {
  Appointment,
  Patient,
  Room,
  User,
  WaitingRoomEntry,
  WaitingRoomPriority,
} from "@prisma/client";
import {
  ArrowRight,
  Bell,
  Check,
  Clock,
  DoorOpen,
  FileText,
  Phone,
  Star,
  UserX,
  Volume2,
} from "lucide-react";

interface EntryWithRelations extends WaitingRoomEntry {
  patient: Patient;
  appointment: Appointment | null;
  room: Pick<Room, "id" | "name"> | null;
  dentist: Pick<User, "id" | "firstName" | "lastName"> | null;
  calledBy: Pick<User, "id" | "firstName" | "lastName"> | null;
  createdBy: Pick<User, "id" | "firstName" | "lastName"> | null;
}

interface WaitingRoomCardProps {
  entry: EntryWithRelations;
  rooms: Pick<Room, "id" | "name">[];
  onCall: (id: string) => void;
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
  onNoShow: (id: string) => void;
  onPriority: (id: string, priority: WaitingRoomPriority) => void;
  onNotify: (id: string) => void;
  onViewFile: (patientId: string) => void;
  onAssignRoom?: (id: string, roomId: string) => void;
  isPending: boolean;
  compact?: boolean;
  index?: number;
  isNext?: boolean;
}

const statusLabels: Record<string, string> = {
  WAITING: "En attente",
  CALLED: "Appelé",
  IN_PROGRESS: "En consultation",
  COMPLETED: "Terminé",
  NO_SHOW: "Absent",
};

const statusVariants: Record<
  string,
  "warning" | "info" | "success" | "danger"
> = {
  WAITING: "warning",
  CALLED: "info",
  IN_PROGRESS: "success",
  COMPLETED: "success",
  NO_SHOW: "danger",
};

export default function WaitingRoomCard({
  entry,
  rooms,
  onCall,
  onStart,
  onComplete,
  onNoShow,
  onPriority,
  onNotify,
  onViewFile,
  onAssignRoom,
  isPending,
  compact,
  index,
  isNext,
}: WaitingRoomCardProps) {
  const waitTime = formatDistanceToNow(new Date(entry.arrivedAt), {
    locale: fr,
    addSuffix: false,
  });

  return (
    <Card
      className={`group transition-shadow hover:shadow-md ${
        entry.priority === "HIGH" ? "border-l-4 border-l-red-500" : ""
      } ${isNext ? "ring-2 ring-violet-500 ring-offset-1" : ""}`}
    >
      <CardContent className={`${compact ? "p-3" : "p-4"}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {index !== undefined && (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                  {index + 1}
                </span>
              )}
              <h3 className="truncate font-semibold text-slate-900">
                {entry.patient.lastName} {entry.patient.firstName}
              </h3>
              {entry.priority === "HIGH" && (
                <Star className="h-4 w-4 shrink-0 fill-red-500 text-red-500" />
              )}
              {entry.room && (
                <Badge variant="default" className="gap-1 text-xs">
                  <DoorOpen className="h-3 w-3" />
                  {entry.room.name}
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500">
              N° {entry.patient.number} ·{" "}
              {entry.arrivalType === "APPOINTMENT" ? "RDV" : "Sans RDV"}
            </p>
          </div>
          <Badge variant={statusVariants[entry.status] ?? "secondary"}>
            {statusLabels[entry.status]}
          </Badge>
        </div>

        {!compact && (
          <>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Arrivé il y a {waitTime}
              </span>
              {entry.dentist && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  Dr. {entry.dentist.lastName}
                </span>
              )}
              {entry.calledBy && entry.status === "CALLED" && (
                <span className="flex items-center gap-1 text-blue-600">
                  <Volume2 className="h-3.5 w-3.5" />
                  Appelé par {entry.calledBy.lastName}
                </span>
              )}
            </div>

            {entry.notes && (
              <p className="mt-2 text-xs text-slate-500">{entry.notes}</p>
            )}

            {onAssignRoom &&
              entry.status !== "COMPLETED" &&
              entry.status !== "NO_SHOW" && (
                <div className="mt-3 max-w-xs">
                  <Select
                    label="Salle"
                    value={entry.roomId || ""}
                    onChange={(e) => onAssignRoom(entry.id, e.target.value)}
                    disabled={isPending}
                    options={[
                      { value: "", label: "— Aucune —" },
                      ...rooms.map((r) => ({ value: r.id, label: r.name })),
                    ]}
                  />
                </div>
              )}
          </>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {entry.status === "WAITING" && (
            <>
              <Button
                size="sm"
                className="h-8 gap-1"
                onClick={() => onCall(entry.id)}
                disabled={isPending}
              >
                <Volume2 className="h-3.5 w-3.5" />
                Appeler
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="h-8 gap-1"
                onClick={() => onStart(entry.id)}
                disabled={isPending}
              >
                <ArrowRight className="h-3.5 w-3.5" />
                Entrer
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 gap-1 text-slate-600"
                onClick={() => onNoShow(entry.id)}
                disabled={isPending}
              >
                <UserX className="h-3.5 w-3.5" />
                Absent
              </Button>
            </>
          )}
          {entry.status === "CALLED" && (
            <>
              <Button
                size="sm"
                className="h-8 gap-1"
                onClick={() => onStart(entry.id)}
                disabled={isPending}
              >
                <ArrowRight className="h-3.5 w-3.5" />
                Commencer
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 gap-1 text-slate-600"
                onClick={() => onCall(entry.id)}
                disabled={isPending}
              >
                <Volume2 className="h-3.5 w-3.5" />
                Rappeler
              </Button>
            </>
          )}
          {entry.status === "IN_PROGRESS" && (
            <Button
              size="sm"
              variant="secondary"
              className="h-8 gap-1"
              onClick={() => onComplete(entry.id)}
              disabled={isPending}
            >
              <Check className="h-3.5 w-3.5" />
              Terminer
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-8 gap-1 text-slate-600"
            onClick={() => onViewFile(entry.patientId)}
          >
            <FileText className="h-3.5 w-3.5" />
            Dossier
          </Button>
          {entry.status !== "COMPLETED" && entry.status !== "NO_SHOW" && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1 text-blue-600"
              onClick={() => onNotify(entry.id)}
              disabled={isPending}
            >
              <Bell className="h-3.5 w-3.5" />
              Notifier
            </Button>
          )}
          {entry.status !== "COMPLETED" && entry.status !== "NO_SHOW" && (
            <Button
              size="sm"
              variant="ghost"
              className={`h-8 gap-1 ${
                entry.priority === "HIGH" ? "text-amber-600" : "text-slate-600"
              }`}
              onClick={() =>
                onPriority(
                  entry.id,
                  entry.priority === "HIGH" ? "NORMAL" : "HIGH",
                )
              }
              disabled={isPending}
            >
              <Star
                className={`h-3.5 w-3.5 ${
                  entry.priority === "HIGH"
                    ? "fill-amber-500 text-amber-500"
                    : ""
                }`}
              />
              {entry.priority === "HIGH" ? "Normal" : "Prioritaire"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
