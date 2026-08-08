"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";

type PublicPlan = {
  id: string;
  plan: string;
  name: string;
  description: string | null;
  monthlyPriceCents: number;
  yearlyPriceCents: number;
  features: string[];
};

interface PricingSectionProps {
  plans: PublicPlan[];
}

export default function PricingSection({ plans }: PricingSectionProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary ring-1 ring-primary-100">
          <Sparkles className="h-4 w-4" />
          Tarifs transparents
        </span>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Une offre adaptée à chaque cabinet
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
          Démarrez gratuitement, évoluez selon vos besoins. Sans engagement.
        </p>
      </div>

      {plans.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
          <p className="text-slate-500">
            Les forfaits seront bientôt disponibles.
          </p>
        </div>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => {
            const isFree = p.monthlyPriceCents === 0;
            const isPopular = p.plan === "PRO";

            return (
              <Card
                key={p.id}
                className={`relative flex flex-col transition-all hover:shadow-lg ${
                  isPopular
                    ? "border-primary-300 ring-1 ring-primary-200"
                    : "border-slate-200"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white shadow-sm">
                    Le plus choisi
                  </div>
                )}
                <CardHeader className="pb-2 pt-6 text-center">
                  <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
                  {p.description && (
                    <p className="mt-1 text-sm text-slate-500">
                      {p.description}
                    </p>
                  )}
                  <div className="mt-4">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {isFree
                        ? "Gratuit"
                        : `${new Intl.NumberFormat("fr-DZ").format(
                            p.monthlyPriceCents / 100,
                          )} DA`}
                    </span>
                    {!isFree && (
                      <span className="text-sm text-slate-500">/mois</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col px-6 pb-6">
                  <ul className="flex-1 space-y-3">
                    {p.features.length === 0 ? (
                      <li className="text-sm text-slate-400">
                        Détails sur demande.
                      </li>
                    ) : (
                      p.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm text-slate-600"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          <span>{feature}</span>
                        </li>
                      ))
                    )}
                  </ul>
                  <Link href="/register" className="mt-6">
                    <Button
                      variant={isPopular ? "primary" : "secondary"}
                      className="w-full"
                    >
                      {isFree ? "Commencer gratuit" : "Choisir ce forfait"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
