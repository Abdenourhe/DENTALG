"use client";

import { useEffect, useState, useCallback } from "react";
import { listActiveWaitingRoom, getClinicInfoForDisplay } from "../actions";
import type {
  Appointment,
  Patient,
  Room,
  User,
  WaitingRoomEntry,
} from "@prisma/client";
import { Volume2, Clock, Maximize, Minimize } from "lucide-react";
import { motion } from "framer-motion";

interface EntryWithRelations extends WaitingRoomEntry {
  patient: Patient;
  appointment: Appointment | null;
  room: Pick<Room, "id" | "name"> | null;
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
  const called = entries
    .filter((e) => e.status === "CALLED")
    .sort(
      (a, b) =>
        new Date(b.calledAt ?? b.arrivedAt).getTime() -
        new Date(a.calledAt ?? a.arrivedAt).getTime(),
    );
  const inProgress = entries.filter((e) => e.status === "IN_PROGRESS");
  const hasCalled = called.length > 0;

  function formatWaitEstimate(position: number) {
    const avgMinutesPerPatient = 15;
    const minutes = (position + 1) * avgMinutesPerPatient;
    if (minutes <= 15) return "Prochainement";
    return `~${minutes} min`;
  }

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

      {/* Main content */}
      <main className="flex min-h-0 flex-1 flex-col gap-6 p-6">
        <div className="flex min-h-0 flex-1 gap-6">
          {/* Primary panel : patient appelé ou liste d’attente principale */}
          <motion.section
            layout
            className={`flex min-w-0 flex-col transition-all duration-700 ease-in-out ${
              hasCalled ? "flex-[2]" : "flex-1"
            }`}
          >
            {hasCalled ? (
              <>
                <h2 className="mb-4 flex items-center gap-3 text-xl font-semibold text-emerald-400">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                  </span>
                  Patient appelé
                </h2>
                <motion.div
                  key={called[0].id}
                  layoutId="called-patient"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 120, damping: 18 }}
                  className="flex min-h-0 flex-1 flex-col justify-center rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 to-slate-900/60 p-10 text-center shadow-[0_0_60px_-12px_rgba(16,185,129,0.25)]"
                >
                  <p className="text-lg font-medium uppercase tracking-[0.2em] text-emerald-300">
                    Veuillez vous rendre au cabinet
                  </p>
                  <h3 className="mt-6 truncate text-6xl font-extrabold text-white md:text-8xl">
                    {called[0].patient.lastName} {called[0].patient.firstName}
                  </h3>
                  {called[0].patient.arabicName && (
                    <p
                      className="mt-4 truncate text-4xl font-semibold text-emerald-200 md:text-6xl"
                      dir="rtl"
                    >
                      {called[0].patient.arabicName}
                    </p>
                  )}
                  <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-2xl text-emerald-100">
                    {called[0].dentist && (
                      <span className="rounded-2xl bg-slate-800/60 px-5 py-2">
                        Dr. {called[0].dentist.lastName}{" "}
                        {called[0].dentist.firstName}
                      </span>
                    )}
                    {called[0].room && (
                      <span className="rounded-2xl bg-emerald-500/20 px-5 py-2 font-semibold text-emerald-300">
                        {called[0].room.name}
                      </span>
                    )}
                  </div>
                  <p className="mt-8 text-sm text-emerald-400/70">
                    Appelé à{" "}
                    {new Date(
                      called[0].calledAt ?? called[0].arrivedAt,
                    ).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </motion.div>
              </>
            ) : (
              <>
                <h2 className="mb-4 text-xl font-semibold text-slate-300">
                  Prochains patients
                </h2>
                <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
                  {waiting.length > 0 ? (
                    waiting.slice(0, 12).map((entry, index) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 p-5 transition-colors hover:bg-slate-800/60"
                      >
                        <div className="flex items-center gap-5">
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xl font-bold text-slate-300">
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-2xl font-semibold">
                              {entry.patient.lastName} {entry.patient.firstName}
                            </p>
                            {entry.patient.arabicName && (
                              <p
                                className="truncate text-lg text-slate-400"
                                dir="rtl"
                              >
                                {entry.patient.arabicName}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              {entry.dentist && (
                                <span>Dr. {entry.dentist.lastName}</span>
                              )}
                              {entry.room && (
                                <span className="text-emerald-300">
                                  · {entry.room.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {entry.priority === "HIGH" ? (
                            <span className="shrink-0 rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-400">
                              Prioritaire
                            </span>
                          ) : (
                            <p className="text-sm text-slate-500">
                              {formatWaitEstimate(index)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-1 flex-col items-center justify-center text-center">
                      <Volume2 className="h-20 w-20 text-slate-700" />
                      <p className="mt-6 text-3xl text-slate-500">
                        En attente du prochain appel
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.section>

          {/* Secondary panel : file compacte quand un patient est appelé */}
          <motion.aside
            layout
            className={`flex min-w-0 flex-col gap-6 transition-all duration-700 ease-in-out ${
              hasCalled
                ? "w-full max-w-md opacity-100"
                : "w-0 opacity-0 overflow-hidden"
            }`}
          >
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
                        <p className="text-xs text-slate-500">
                          {formatWaitEstimate(index)}
                        </p>
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
          </motion.aside>
        </div>

        {/* En consultation */}
        {inProgress.length > 0 && (
          <motion.section
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="shrink-0"
          >
            <h2 className="mb-3 text-lg font-semibold text-slate-400">
              En consultation
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {inProgress.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4"
                >
                  <Clock className="h-5 w-5 text-violet-400" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {entry.patient.lastName} {entry.patient.firstName}
                    </p>
                    {entry.room && (
                      <p className="text-xs text-slate-500">
                        {entry.room.name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}
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
