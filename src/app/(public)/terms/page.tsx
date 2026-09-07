import type { Metadata } from "next";
import PublicHeader from "../_components/PublicHeader";
import PublicFooter from "../_components/PublicFooter";

export const metadata: Metadata = {
  title: "Conditions d'utilisation — DENTALG",
  description:
    "Les conditions d'utilisation de la plateforme DENTALG pour les cabinets dentaires.",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Conditions d&apos;utilisation
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
            <h2 className="text-lg font-semibold text-slate-900">1. Objet</h2>
            <p className="mt-2 leading-relaxed">
              DENTALG est un service en ligne (SaaS) de gestion de cabinets
              dentaires : patients, rendez-vous, facturation, prescriptions et
              recrutement. L&apos;utilisation de la plateforme implique
              l&apos;acceptation pleine et entière des présentes conditions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">
              2. Compte et responsabilité du cabinet
            </h2>
            <p className="mt-2 leading-relaxed">
              Chaque cabinet est responsable de la confidentialité de ses
              identifiants, de l&apos;exactitude des informations saisies et du
              respect de la réglementation applicable à l&apos;exercice de la
              dentisterie et à la protection des données de santé.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">
              3. Disponibilité du service
            </h2>
            <p className="mt-2 leading-relaxed">
              DENTALG met en œuvre les moyens raisonnables pour assurer la
              disponibilité et la sauvegarde continue du service, sans garantie
              d&apos;absence totale d&apos;interruption (maintenance, cas de
              force majeure).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">
              4. Facturation et résiliation
            </h2>
            <p className="mt-2 leading-relaxed">
              Les forfaits payants sont facturés selon la périodicité choisie à
              l&apos;abonnement. Un cabinet peut résilier son abonnement à tout
              moment ; les données restent accessibles pour export pendant une
              période raisonnable après résiliation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">5. Contact</h2>
            <p className="mt-2 leading-relaxed">
              Pour toute question sur ces conditions, contactez-nous via la page{" "}
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
