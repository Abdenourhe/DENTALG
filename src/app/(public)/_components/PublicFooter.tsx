import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="DENTALG" className="h-6 w-auto" />
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              Le SaaS de gestion conçu pour les cabinets dentaires en Algérie.
              Patients, rendez-vous, facturation et recrutement en un seul
              endroit.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">Produit</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
              <li>
                <Link
                  href="/fonctionnalites"
                  className="transition-colors hover:text-primary"
                >
                  Fonctionnalités
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="transition-colors hover:text-primary"
                >
                  Tarifs
                </Link>
              </li>
              <li>
                <Link
                  href="/carrieres"
                  className="transition-colors hover:text-primary"
                >
                  Carrières dentaires
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">Espace pro</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
              <li>
                <Link
                  href="/login"
                  className="transition-colors hover:text-primary"
                >
                  Connexion
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="transition-colors hover:text-primary"
                >
                  Créer un compte
                </Link>
              </li>
              <li>
                <Link
                  href="/request-clinic"
                  className="transition-colors hover:text-primary"
                >
                  Demander une démo
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">Légal</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
              <li>
                <Link
                  href="/privacy"
                  className="transition-colors hover:text-primary"
                >
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="transition-colors hover:text-primary"
                >
                  Conditions d&apos;utilisation
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 sm:flex-row">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} DENTALG. Tous droits réservés.
          </p>
          <p className="text-xs text-slate-400">
            Conçu et hébergé en Algérie 🇩🇿
          </p>
        </div>
      </div>
    </footer>
  );
}
