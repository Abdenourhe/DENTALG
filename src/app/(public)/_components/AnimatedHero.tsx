"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Clock,
  Calendar,
} from "lucide-react";

const benefits = [
  "Multi-cabinet & multi-utilisateurs",
  "Conforme réglementation algérienne",
  "Accès sécurisé par rôles",
  "Sauvegarde cloud automatique",
];

interface AnimatedHeroProps {
  stats?: {
    clinics: number;
    offers: number;
  };
}

export default function AnimatedHero({ stats }: AnimatedHeroProps) {
  return (
    <section className="relative overflow-hidden bg-slate-900 px-6 pb-20 pt-16 sm:pb-28 sm:pt-24">
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-primary/30 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute -right-20 top-40 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"
        />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Text */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-primary-200 ring-1 ring-white/20 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Solution 100% algérienne
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              Gérez votre cabinet
              <br />
              <span className="bg-gradient-to-r from-primary-300 to-blue-400 bg-clip-text text-transparent">
                dentaire en toute simplicité
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mt-6 max-w-xl text-lg text-slate-300 lg:mx-0"
            >
              DENTALG est le SaaS de gestion conçu pour les cabinets dentaires
              en Algérie. Patients, rendez-vous, facturation et recrutement —
              tout en un seul endroit.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start"
            >
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-700 hover:shadow-xl hover:shadow-primary/30"
              >
                Créer un compte gratuit
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/carrieres"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm transition-all hover:bg-white/15"
              >
                Offres dentaires
              </Link>
            </motion.div>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:justify-start"
            >
              {benefits.map((b) => (
                <span
                  key={b}
                  className="flex items-center gap-1.5 text-sm text-slate-400"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  {b}
                </span>
              ))}
            </motion.div>

            {/* Stats */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mx-auto mt-10 grid max-w-sm grid-cols-2 gap-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur-sm lg:mx-0"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {stats.clinics}+
                  </div>
                  <div className="text-xs text-slate-400">
                    cabinets inscrits
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {stats.offers}+
                  </div>
                  <div className="text-xs text-slate-400">offres publiées</div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Visual mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-2xl border border-slate-700/50 bg-slate-800/60 p-4 shadow-2xl backdrop-blur-sm">
              {/* Window header */}
              <div className="mb-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
                <div className="ml-4 h-2 w-24 rounded-full bg-slate-600" />
              </div>

              {/* Dashboard cards */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-900/80 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Patients</span>
                    <Shield className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="mt-2 text-2xl font-bold text-white">
                    1 248
                  </div>
                  <div className="mt-1 text-xs text-emerald-400">
                    +12 ce mois
                  </div>
                </div>
                <div className="rounded-xl bg-slate-900/80 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Rendez-vous</span>
                    <Calendar className="h-4 w-4 text-primary-300" />
                  </div>
                  <div className="mt-2 text-2xl font-bold text-white">86</div>
                  <div className="mt-1 text-xs text-primary-300">
                    Cette semaine
                  </div>
                </div>
                <div className="rounded-xl bg-slate-900/80 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Chiffre du mois
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      DA
                    </span>
                  </div>
                  <div className="mt-2 text-2xl font-bold text-white">
                    485 000
                  </div>
                  <div className="mt-1 text-xs text-emerald-400">+8.5%</div>
                </div>
                <div className="rounded-xl bg-slate-900/80 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Tâches</span>
                    <Clock className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="mt-2 text-2xl font-bold text-white">14</div>
                  <div className="mt-1 text-xs text-amber-400">En attente</div>
                </div>
              </div>

              {/* Mini chart */}
              <div className="mt-3 rounded-xl bg-slate-900/80 p-4">
                <div className="flex items-end gap-2">
                  {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-primary/70 transition-all hover:bg-primary"
                      style={{ height: `${h * 0.8}px` }}
                    />
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-slate-500">
                  <span>Lun</span>
                  <span>Mar</span>
                  <span>Mer</span>
                  <span>Jeu</span>
                  <span>Ven</span>
                  <span>Sam</span>
                  <span>Dim</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
