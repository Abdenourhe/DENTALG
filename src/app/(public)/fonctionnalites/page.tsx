"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  FileText,
  CalendarDays,
  Pill,
  CreditCard,
  FlaskConical,
  Package,
  BarChart3,
  Shield,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import PublicHeader from "../_components/PublicHeader";

const features = [
  {
    id: "dossier-patient",
    icon: FileText,
    title: "Dossier patient & odontogramme",
    body: "Chaque patient dispose d'un dossier centralisé : informations générales, historique médical, état général avec alertes automatiques, et un odontogramme interactif — un schéma dentaire cliquable où chaque dent est directement liée aux actes réalisés.",
    bullets: [
      "Schéma dentaire complet (32 dents), cliquable, avec historique visuel des soins par dent",
      "Enregistrement de l'état général du patient (allergies, pathologies, traitements en cours)",
      "Alertes cliniques automatiques : DENTALG signale la conduite à tenir selon les comorbidités déclarées",
      "Examens complémentaires : exobuccal, endobuccal, mandibulaire",
      "Fiche patient et fiche traitement imprimables en un clic",
      "Gestion de la salle d'attente en temps réel",
    ],
    imagePosition: "right" as const,
  },
  {
    id: "rendez-vous",
    icon: CalendarDays,
    title: "Rendez-vous intelligents",
    body: "Planifiez vos consultations sur une vue calendrier claire (jour/semaine), et laissez DENTALG réduire vos rendez-vous manqués grâce aux rappels automatiques.",
    bullets: [
      "Vue calendrier par créneau horaire, par praticien",
      "SMS de rappel automatique avant chaque rendez-vous",
      "Gestion des jours fériés et des disponibilités",
      "Historique des rendez-vous par patient",
      "Liste d'attente et gestion des annulations en temps réel",
    ],
    imagePosition: "left" as const,
  },
  {
    id: "ordonnances",
    icon: Pill,
    title: "Ordonnances & prescriptions",
    body: "Une base de médicaments intégrée, des modèles d'ordonnances par pathologie, et une génération bilingue — DENTALG accélère la partie la plus répétitive de votre consultation.",
    bullets: [
      "Base de médicaments avec recherche instantanée",
      "Modèles d'ordonnances prédéfinis par motif (abcès, cellulite, allergies…)",
      "Calculateur de dose pédiatrique (ex. amoxicilline enfant)",
      "Génération d'ordonnances en français et en arabe",
      "Impression directe ou aperçu avant impression",
      "Certificats médicaux générés depuis le même module",
    ],
    imagePosition: "right" as const,
  },
  {
    id: "facturation",
    icon: CreditCard,
    title: "Facturation & conformité CNAS/CASNOS",
    body: "Contrairement aux logiciels génériques, DENTALG intègre nativement la codification CNAS/CASNOS — plus besoin de gérer ça à part ou sur papier.",
    bullets: [
      "Table de codification des actes conforme CNAS/CASNOS",
      "Devis, factures et avoirs conformes à la réglementation algérienne",
      "Paiements partiels et suivi des soldes dus",
      "Liste des patients endettés avec relance facilitée",
      "Calcul automatique de la recette du cabinet",
    ],
    imagePosition: "left" as const,
  },
  {
    id: "laboratoire",
    icon: FlaskConical,
    title: "Laboratoire & prothèses",
    body: "Suivez chaque envoi de prothèse — du laboratoire jusqu'au patient — sans tableur externe.",
    bullets: [
      "Suivi par type de prothèse, laboratoire, date de réception et de livraison",
      "Statut de paiement par commande (payé / en attente)",
      "Filtrage par laboratoire ou par état de livraison",
      "Historique complet consultable à tout moment",
    ],
    imagePosition: "right" as const,
  },
  {
    id: "stock",
    icon: Package,
    title: "Gestion de stock",
    body: "Consommables, produits, matériel — gérez vos entrées et sorties de stock avec alertes automatiques avant la rupture ou la péremption.",
    bullets: [
      "Fiche produit avec code-barres, quantité, prix d'achat, fournisseur",
      "Alertes de péremption et de stock épuisé",
      "Entrées/sorties de stock avec journal de consommation",
      "Modification en masse des prix ou quantités",
    ],
    imagePosition: "left" as const,
  },
  {
    id: "finances",
    icon: BarChart3,
    title: "Finances & rapports",
    body: "Suivez vos revenus, vos dépenses et votre rentabilité en temps réel, avec des statistiques prêtes à l'emploi.",
    bullets: [
      "Suivi des dépenses par catégorie",
      "Recette du cabinet et inventaire périodique sur toute période",
      "Répartition des gains par praticien (cabinets à plusieurs médecins)",
      "Statistiques patients (par état de santé, sexe, type de traitement)",
      "Rapport de revenu par acte et par année, avec graphiques",
    ],
    imagePosition: "right" as const,
  },
  {
    id: "securite",
    icon: Shield,
    title: "Sécurité & multi-cabinet",
    body: "Que vous soyez seul ou en cabinet de groupe, DENTALG s'adapte : gestion de plusieurs praticiens, sauvegardes automatiques, et contrôle total sur vos données.",
    bullets: [
      "Gestion multi-médecins et multi-postes",
      "Sauvegarde et restauration de la base de données",
      "Corbeille de récupération des données supprimées",
      "Accès sécurisé par rôles (OWNER, DENTIST, ASSISTANT, SECRETARY)",
      "Personnalisation des actes selon votre pratique",
    ],
    imagePosition: "left" as const,
  },
];

function FeatureSection({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const Icon = feature.icon;
  const isRight = feature.imagePosition === "right";

  return (
    <section id={feature.id} className="py-16 scroll-mt-20">
      <div
        className={`mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 ${
          isRight ? "lg:flex-row" : "lg:flex-row-reverse"
        }`}
      >
        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: isRight ? -30 : 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="flex-1"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {feature.title}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-500">
            {feature.body}
          </p>
          <ul className="mt-6 space-y-3">
            {feature.bullets.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <span className="text-sm leading-relaxed text-slate-600">{b}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Visual placeholder */}
        <motion.div
          initial={{ opacity: 0, x: isRight ? 30 : -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-1"
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
              <Icon className="mb-3 h-16 w-16 opacity-20" />
              <span className="text-sm font-medium">{feature.title}</span>
              <span className="mt-1 text-xs text-slate-400">Capture à venir</span>
            </div>
            <div
              className={`pointer-events-none absolute -bottom-10 h-40 w-full bg-gradient-to-t ${
                index % 2 === 0 ? "from-primary/5" : "from-blue-500/5"
              } to-transparent`}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FeatureNav() {
  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-center gap-1 overflow-x-auto py-3 no-scrollbar">
          {features.map((f) => (
            <a
              key={f.id}
              href={`#${f.id}`}
              className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              {f.title.split(" &")[0]}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default function FonctionnalitesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader active="fonctionnalites" />

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 px-6 pb-20 pt-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -right-20 top-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-primary-200 ring-1 ring-white/20 backdrop-blur-sm">
              Tout ce qu&apos;il vous faut, rien de superflu
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-5xl"
          >
            Un logiciel pensé pour la réalité d&apos;un cabinet dentaire algérien
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-slate-300"
          >
            De la prise de rendez-vous à la facturation CNAS, en passant par le
            dossier patient et le suivi du laboratoire — DENTALG couvre tout le
            parcours, dans un seul outil.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-700"
            >
              Créer un compte
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm transition-all hover:bg-white/15"
            >
              Voir une démo
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Sticky nav */}
      <FeatureNav />

      {/* Features */}
      <main className="mx-auto w-full max-w-6xl">
        {features.map((f, i) => (
          <FeatureSection key={f.id} feature={f} index={i} />
        ))}
      </main>

      {/* CTA final */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-20 pt-10">
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
              Prêt à essayer DENTALG dans votre cabinet ?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-primary-200">
              Créez votre compte cabinet en quelques minutes — aucune carte
              bancaire requise pour commencer.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary-900 shadow-lg transition-all hover:bg-primary-50"
              >
                Créer un compte
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/request-clinic"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm transition-all hover:bg-white/15"
              >
                Demander une démo personnalisée
              </Link>
            </div>
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
