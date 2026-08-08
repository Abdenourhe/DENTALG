import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-6 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
        Gérez votre cabinet
        <br />
        <span className="text-primary-300">dentaire en toute simplicité</span>
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
        DENTALG est le SaaS de gestion conçu pour les cabinets dentaires en
        Algérie. Patients, rendez-vous, facturation — tout en un seul endroit.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link href="/register">
          <Button size="lg">Créer un compte</Button>
        </Link>
        <Link href="/login">
          <Button variant="secondary" size="lg">
            Se connecter
          </Button>
        </Link>
      </div>
    </main>
  );
}
