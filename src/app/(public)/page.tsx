import PublicHeader from "./_components/PublicHeader";
import AnimatedHero from "./_components/AnimatedHero";
import AnimatedFeatures from "./_components/AnimatedFeatures";
import LandingJobOffers from "./_components/LandingJobOffers";
import PricingSection from "./_components/PricingSection";
import AnimatedCTA from "./_components/AnimatedCTA";
import { getPublicStats } from "@/lib/actions/public-stats";
import { listPublicPlans } from "@/lib/actions/plans";
import Link from "next/link";

export default async function HomePage() {
  const [stats, plans] = await Promise.all([
    getPublicStats(),
    listPublicPlans(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader active="home" />
      <AnimatedHero stats={stats} />
      <AnimatedFeatures />
      <LandingJobOffers />
      <PricingSection plans={plans} />
      <AnimatedCTA />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="DENTALG" className="h-6 w-auto" />
            <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
              <Link href="/fonctionnalites" className="hover:text-slate-900">
                Fonctionnalités
              </Link>
              <Link href="/carrieres" className="hover:text-slate-900">
                Carrières
              </Link>
              <Link href="/register" className="hover:text-slate-900">
                Tarifs
              </Link>
              <Link href="/login" className="hover:text-slate-900">
                Connexion
              </Link>
            </nav>
          </div>
          <div className="mt-8 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} DENTALG. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
