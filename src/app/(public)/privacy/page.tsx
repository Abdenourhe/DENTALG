import type { Metadata } from "next";
import PublicHeader from "../_components/PublicHeader";
import PublicFooter from "../_components/PublicFooter";

export const metadata: Metadata = {
  title: "Politique de confidentialité — DENTALG",
  description:
    "Comment DENTALG collecte, protège et utilise les données de votre cabinet et de vos patients.",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Politique de confidentialité
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Dernière mise à jour :{" "}
          {new Date().toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
          })}
        </p>

        <div className="prose prose-slate mt-10 max-w-none space-y-8 text-slate-600">
          <section>
            <h2 className="text-lg font-semibold text-slate-900">
              1. Données collectées
            </h2>
            <p className="mt-2 leading-relaxed">
              DENTALG héberge, pour le compte de chaque cabinet dentaire client,
              les données nécessaires à la gestion du cabinet : identité et
              coordonnées des patients, historique médical et dentaire,
              rendez-vous, documents (ordonnances, devis, factures) et pièces
              jointes. Le cabinet reste seul responsable du contenu qu&apos;il
              saisit dans la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">
              2. Utilisation des données
            </h2>
            <p className="mt-2 leading-relaxed">
              Les données ne sont utilisées que pour fournir le service aux
              cabinets abonnés (accès cloisonné par cabinet). DENTALG ne vend,
              ne partage et n&apos;exploite à des fins commerciales aucune
              donnée patient.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">
              3. Sécurité
            </h2>
            <p className="mt-2 leading-relaxed">
              Accès protégé par authentification et gestion de rôles,
              cloisonnement strict des données entre cabinets, suppression
              logique (aucune perte accidentelle de dossier), et fichiers
              stockés via des liens signés à durée limitée.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">
              4. Vos droits
            </h2>
            <p className="mt-2 leading-relaxed">
              Pour toute question sur vos données ou pour exercer vos droits
              d&apos;accès, de rectification ou de suppression, contactez le
              cabinet dentaire qui gère votre dossier, ou l&apos;équipe DENTALG
              via la page{" "}
              <a href="/request-clinic" className="text-primary underline">
                contact
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
