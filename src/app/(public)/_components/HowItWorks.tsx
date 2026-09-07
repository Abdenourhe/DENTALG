"use client";

import { motion } from "framer-motion";
import { UserPlus, Settings, Rocket } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "1",
    title: "Créez votre compte",
    description:
      "Inscrivez votre cabinet en quelques minutes, sans engagement ni carte bancaire.",
  },
  {
    icon: Settings,
    step: "2",
    title: "Configurez votre cabinet",
    description:
      "Salles, praticiens, tarifs et modèles de documents : personnalisez DENTALG selon votre organisation.",
  },
  {
    icon: Rocket,
    step: "3",
    title: "Gérez au quotidien",
    description:
      "Patients, agenda, facturation et recrutement centralisés — accessibles à toute votre équipe.",
  },
];

export default function HowItWorks() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Opérationnel en trois étapes
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
          Aucune installation, aucune formation complexe : DENTALG est pensé
          pour être pris en main immédiatement.
        </p>
      </div>

      <div className="relative mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3">
        <div className="pointer-events-none absolute left-0 right-0 top-8 hidden h-px bg-slate-200 sm:block" />
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 ring-1 ring-primary-100">
                <Icon className="h-7 w-7 text-primary" />
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {s.step}
                </span>
              </div>
              <h3 className="mt-5 text-base font-semibold text-slate-900">
                {s.title}
              </h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-500">
                {s.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
