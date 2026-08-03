"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Stethoscope,
  CalendarDays,
  CreditCard,
  Shield,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Stethoscope,
    title: "Gestion des patients",
    description:
      "Dossiers patients complets, historique médical, prescriptions et ordonnances numériques.",
    color: "bg-blue-50 text-blue-600 ring-blue-200",
  },
  {
    icon: CalendarDays,
    title: "Rendez-vous intelligents",
    description:
      "Planification optimisée, rappels automatiques et gestion des annulations en temps réel.",
    color: "bg-purple-50 text-purple-600 ring-purple-200",
  },
  {
    icon: CreditCard,
    title: "Facturation simplifiée",
    description:
      "Devis, factures et avoirs conformes à la réglementation algérienne, paiements suivis.",
    color: "bg-emerald-50 text-emerald-600 ring-emerald-200",
  },
  {
    icon: Shield,
    title: "Sécurité des données",
    description:
      "Données de santé protégées, conformité RGPD, soft-delete et traçabilité complète.",
    color: "bg-amber-50 text-amber-600 ring-amber-200",
  },
];

const benefits = [
  "Multi-cabinet & multi-utilisateurs",
  "Conforme réglementation algérienne",
  "Accès sécurisé par rôles",
  "Sauvegarde cloud automatique",
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
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

        <div className="relative mx-auto max-w-5xl text-center">
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
            className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl"
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
            className="mx-auto mt-6 max-w-2xl text-lg text-slate-300"
          >
            DENTALG est le SaaS de gestion conçu pour les cabinets dentaires en
            Algérie. Patients, rendez-vous, facturation — tout en un seul
            endroit.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-700 hover:shadow-xl hover:shadow-primary/30"
            >
              Créer un compte
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm transition-all hover:bg-white/15"
            >
              Se connecter
            </Link>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
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
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Tout ce qu&apos;il faut pour votre cabinet
          </h2>
          <p className="mt-3 text-slate-500">
            Une suite complète d&apos;outils pensés pour les dentistes
            algériens.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ring-1 ${f.color} transition-transform group-hover:scale-110`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {f.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl bg-primary-900 px-6 py-16 text-center"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-primary-700/40 blur-3xl" />
            <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />
          </div>
          <div className="relative">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Prêt à moderniser votre cabinet ?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-primary-200">
              Rejoignez les cabinets dentaires qui utilisent DENTALG pour gagner
              du temps chaque jour.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary-900 shadow-lg transition-all hover:bg-primary-50"
            >
              Commencer gratuitement
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="DENTALG" className="h-6 w-auto" />
          </div>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} DENTALG. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
