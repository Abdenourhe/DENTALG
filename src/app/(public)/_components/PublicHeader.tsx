import Link from "next/link";

interface PublicHeaderProps {
  active?: "home" | "carrieres" | "fonctionnalites" | "tarifs";
}

export default function PublicHeader({ active }: PublicHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="DENTALG" className="h-7 w-auto" />
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link
            href="/fonctionnalites"
            className={
              active === "fonctionnalites"
                ? "font-semibold text-primary"
                : "font-medium text-slate-600 transition-colors hover:text-slate-900"
            }
          >
            Fonctionnalités
          </Link>
          <Link
            href="/carrieres"
            className={
              active === "carrieres"
                ? "font-semibold text-primary"
                : "font-medium text-slate-600 transition-colors hover:text-slate-900"
            }
          >
            Carrières
          </Link>
          <Link
            href="/register"
            className={
              active === "tarifs"
                ? "font-semibold text-primary"
                : "font-medium text-slate-600 transition-colors hover:text-slate-900"
            }
          >
            Tarifs
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary-800"
          >
            Connexion pro
          </Link>
        </nav>
      </div>
    </header>
  );
}
