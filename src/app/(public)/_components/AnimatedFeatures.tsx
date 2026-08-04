"use client";

import { motion } from "framer-motion";
import {
  Stethoscope,
  CalendarDays,
  CreditCard,
  Shield,
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

export default function AnimatedFeatures() {
  return (
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
  );
}
