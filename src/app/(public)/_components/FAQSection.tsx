"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question:
      "Mes données patients sont-elles partagées avec d'autres cabinets ?",
    answer:
      "Non. Chaque cabinet dispose d'un espace totalement cloisonné : aucune donnée n'est jamais visible ou accessible depuis un autre cabinet.",
  },
  {
    question: "Puis-je essayer DENTALG gratuitement ?",
    answer:
      "Oui, la création de compte est gratuite et sans engagement. Vous pouvez évoluer vers un forfait supérieur quand votre cabinet en a besoin.",
  },
  {
    question:
      "DENTALG fonctionne-t-il avec plusieurs praticiens et plusieurs salles ?",
    answer:
      "Oui, la plateforme est conçue pour le multi-utilisateur et le multi-salle, avec des rôles et permissions différents (praticien, secrétaire, gérant).",
  },
  {
    question: "Que se passe-t-il si j'arrête mon abonnement ?",
    answer:
      "Vous gardez accès à l'export de vos données pendant une période raisonnable après résiliation. Aucune donnée n'est supprimée brutalement.",
  },
  {
    question: "La facturation respecte-t-elle la réglementation algérienne ?",
    answer:
      "Oui, la numérotation des devis, factures et avoirs suit une séquence légale par cabinet, et une facture émise n'est jamais supprimée ni renumérotée.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-20">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Questions fréquentes
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-500">
          Tout ce que les cabinets nous demandent avant de démarrer.
        </p>
      </div>

      <div className="mt-10 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={faq.question}>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-semibold text-slate-900 sm:text-base">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-6 pb-5 text-sm leading-relaxed text-slate-500">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
