"use client";

import { useEffect, useState, useCallback } from "react";
import { listActiveWaitingRoom, getClinicInfoForDisplay } from "../actions";
import type {
  Appointment,
  Patient,
  User,
  WaitingRoomEntry,
} from "@prisma/client";
import { Volume2, Clock, Maximize, Minimize } from "lucide-react";

interface EntryWithRelations extends WaitingRoomEntry {
  patient: Patient;
  appointment: Appointment | null;
  dentist: Pick<User, "id" | "firstName" | "lastName"> | null;
  calledBy: Pick<User, "id" | "firstName" | "lastName"> | null;
}

export default function WaitingRoomDisplayPage() {
  const [entries, setEntries] = useState<EntryWithRelations[]>([]);
  const [clinic, setClinic] = useState<{
    name: string;
    logoUrl: string | null;
    phone: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        // ignore
      });
    } else {
      document.exitFullscreen().catch(() => {
        // ignore
      });
    }
  }, []);

  useEffect(() => {
    function handleChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  async function load() {
    try {
      const [data, clinicData] = await Promise.all([
        listActiveWaitingRoom(),
        getClinicInfoForDisplay(),
      ]);
      setEntries(data);
      setClinic(clinicData);
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

  const waiting = entries
    .filter((e) => e.status === "WAITING")
    .sort(
      (a, b) =>
        (a.priority === "HIGH" ? 0 : 1) - (b.priority === "HIGH" ? 0 : 1) ||
        new Date(a.arrivedAt).getTime() - new Date(b.arrivedAt).getTime(),
    );
  const called = entries.filter((e) => e.status === "CALLED");
  const inProgress = entries.filter((e) => e.status === "IN_PROGRESS");

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-950 text-white">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/50 px-6 py-4">
        <div className="flex items-center gap-4">
          {clinic?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={clinic.logoUrl}
              alt={clinic.name}
              className="h-12 w-auto rounded-lg bg-white object-contain p-1"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800">
              <Volume2 className="h-6 w-6 text-emerald-400" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {clinic?.name ?? "Salle d’attente"}
            </h1>
            <p className="text-sm text-slate-400">
              Veuillez patienter, vous serez appelé(e) à votre tour.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={toggleFullscreen}
            className="rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
          >
            {isFullscreen ? (
              <Minimize className="h-5 w-5" />
            ) : (
              <Maximize className="h-5 w-5" />
            )}
          </button>
          <div className="text-right">
            <p className="text-3xl font-bold tabular-nums">
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
        </div>
      </header>

      {/* Stats */}
      <div className="grid shrink-0 grid-cols-3 gap-px border-b border-slate-800 bg-slate-800">
        <div className="flex items-center justify-center gap-3 bg-slate-950 py-3">
          <span className="text-3xl font-bold text-amber-400">
            {waiting.length}
          </span>
          <span className="text-sm font-medium text-slate-300">En attente</span>
        </div>
        <div className="flex items-center justify-center gap-3 bg-slate-950 py-3">
          <span className="text-3xl font-bold text-blue-400">
            {called.length}
          </span>
          <span className="text-sm font-medium text-slate-300">Appelés</span>
        </div>
        <div className="flex items-center justify-center gap-3 bg-slate-950 py-3">
          <span className="text-3xl font-bold text-violet-400">
            {inProgress.length}
          </span>
          <span className="text-sm font-medium text-slate-300">
            En consultation
          </span>
        </div>
      </div>

      {/* Main content */}
      <main className="flex min-h-0 flex-1 gap-6 p-6">
        {/* Called patient */}
        <section className="flex min-w-0 flex-[2] flex-col">
          <h2 className="mb-4 text-xl font-semibold text-emerald-400">
            Patient appelé
          </h2>
          <div className="flex min-h-0 flex-1 flex-col justify-center rounded-3xl border-2 border-emerald-500/30 bg-emerald-950/30 p-10 text-center">
            {called.length > 0 ? (
              <>
                <p className="text-lg font-medium uppercase tracking-widest text-emerald-300">
                  Veuillez vous rendre au cabinet
                </p>
                <h3 className="mt-6 truncate text-6xl font-extrabold text-white md:text-8xl">
                  {called[0].patient.lastName} {called[0].patient.firstName}
                </h3>
                <div className="mt-8 flex items-center justify-center gap-6 text-2xl text-emerald-200">
                  {called[0].dentist && (
                    <span>
                      Dr. {called[0].dentist.lastName}{" "}
                      {called[0].dentist.firstName}
                    </span>
                  )}
                  <span className="rounded-full bg-emerald-500/20 px-4 py-1 text-lg font-semibold text-emerald-300">
                    Salle 1
                  </span>
                </div>
              </>
            ) : (
              <>
                <Volume2 className="mx-auto h-20 w-20 text-slate-700" />
                <p className="mt-6 text-3xl text-slate-500">
                  En attente du prochain appel
                </p>
              </>
            )}
          </div>
        </section>

        {/* Side panels */}
        <aside className="flex w-full max-w-md flex-col gap-6">
          <section className="flex min-h-0 flex-1 flex-col">
            <h2 className="mb-4 text-lg font-semibold text-slate-300">
              Prochains patients
            </h2>
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              {waiting.slice(0, 8).map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-4"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-lg font-bold text-slate-300">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold">
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
                    <span className="shrink-0 rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-400">
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
          </section>

          {inProgress.length > 0 && (
            <section className="shrink-0">
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
                    <p className="truncate font-medium">
                      {entry.patient.lastName} {entry.patient.firstName}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>
      </main>

      {loading && (
        <div className="absolute bottom-4 right-4 text-xs text-slate-600">
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
