"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const benefits = [
  "Multi-cabinet & multi-utilisateurs",
  "Conforme réglementation algérienne",
  "Accès sécurisé par rôles",
  "Sauvegarde cloud automatique",
];

export default function AnimatedHero() {
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
  );
}
