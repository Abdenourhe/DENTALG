import AnimatedHero from "./_components/AnimatedHero";
import AnimatedFeatures from "./_components/AnimatedFeatures";
import AnimatedCTA from "./_components/AnimatedCTA";
import CareersPreviewSection from "./_components/CareersPreview";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AnimatedHero />
      <AnimatedFeatures />
      <CareersPreviewSection />
      <AnimatedCTA />

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
