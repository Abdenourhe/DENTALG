"use client";

import { useEffect, useState } from "react";
import { listActiveWaitingRoom } from "../actions";
import type {
  Appointment,
  Patient,
  User,
  WaitingRoomEntry,
} from "@prisma/client";
import { Volume2, Clock } from "lucide-react";

interface EntryWithRelations extends WaitingRoomEntry {
  patient: Patient;
  appointment: Appointment | null;
  dentist: Pick<User, "id" | "firstName" | "lastName"> | null;
  calledBy: Pick<User, "id" | "firstName" | "lastName"> | null;
}

export default function WaitingRoomDisplayPage() {
  const [entries, setEntries] = useState<EntryWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  async function load() {
    try {
      const data = await listActiveWaitingRoom();
      setEntries(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(interval);
      clearInterval(clockInterval);
    };
  }, []);

  const called = entries.filter((e) => e.status === "CALLED");
  const waiting = entries
    .filter((e) => e.status === "WAITING")
    .sort(
      (a, b) =>
        (a.priority === "HIGH" ? 0 : 1) - (b.priority === "HIGH" ? 0 : 1) ||
        new Date(a.arrivedAt).getTime() - new Date(b.arrivedAt).getTime(),
    );
  const inProgress = entries.filter((e) => e.status === "IN_PROGRESS");

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <header className="flex items-center justify-between border-b border-slate-800 px-8 py-5">
        <div className="flex items-center gap-4">
          <Volume2 className="h-8 w-8 text-emerald-400" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Salle d’attente
            </h1>
            <p className="text-sm text-slate-400">
              Veuillez patienter, vous serez appelé(e) à votre tour.
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold tabular-nums">
            {currentTime.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <p className="text-sm text-slate-400">
            {currentTime.toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
      </header>

      <main className="flex flex-1 gap-6 p-6">
        <section className="flex flex-1 flex-col">
          <h2 className="mb-4 text-xl font-semibold text-emerald-400">
            Patient appelé
          </h2>
          {called.length > 0 ? (
            <div className="flex flex-1 flex-col justify-center rounded-3xl border-2 border-emerald-500/30 bg-emerald-950/30 p-10 text-center">
              <p className="text-lg font-medium uppercase tracking-widest text-emerald-300">
                Veuillez vous rendre au cabinet
              </p>
              <h3 className="mt-4 text-6xl font-extrabold text-white md:text-8xl">
                {called[0].patient.lastName} {called[0].patient.firstName}
              </h3>
              {called[0].dentist && (
                <p className="mt-6 text-3xl text-emerald-200">
                  Dr. {called[0].dentist.lastName} {called[0].dentist.firstName}
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/50 p-10 text-center">
              <p className="text-2xl text-slate-500">
                En attente du prochain appel
              </p>
            </div>
          )}
        </section>

        <aside className="w-full max-w-md">
          <h2 className="mb-4 text-xl font-semibold text-slate-300">
            Prochains patients
          </h2>
          <div className="space-y-3">
            {waiting.slice(0, 8).map((entry, index) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-4"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-lg font-bold text-slate-300">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-lg font-semibold">
                      {entry.patient.lastName} {entry.patient.firstName}
                    </p>
                    {entry.dentist && (
                      <p className="text-sm text-slate-400">
                        Dr. {entry.dentist.lastName}
                      </p>
                    )}
                  </div>
                </div>
                {entry.priority === "HIGH" && (
                  <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-400">
                    Prioritaire
                  </span>
                )}
              </div>
            ))}
            {waiting.length === 0 && (
              <p className="py-10 text-center text-slate-500">
                Aucun patient en attente.
              </p>
            )}
          </div>

          {inProgress.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-lg font-semibold text-slate-400">
                En consultation
              </h2>
              <div className="space-y-2">
                {inProgress.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 p-3"
                  >
                    <Clock className="h-5 w-5 text-violet-400" />
                    <p className="font-medium">
                      {entry.patient.lastName} {entry.patient.firstName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </main>

      {loading && (
        <div className="absolute bottom-4 right-4 text-xs text-slate-500">
          Chargement…
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body { background: #020617; color: white; }
            }
          `,
        }}
      />
    </div>
  );
}
