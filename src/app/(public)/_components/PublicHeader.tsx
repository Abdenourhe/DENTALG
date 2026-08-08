"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

interface PublicHeaderProps {
  active?: "home" | "carrieres" | "fonctionnalites" | "tarifs";
}

const navItems = [
  {
    href: "/fonctionnalites",
    label: "Fonctionnalités",
    key: "fonctionnalites",
  },
  { href: "/carrieres", label: "Carrières", key: "carrieres" },
  { href: "/register", label: "Tarifs", key: "tarifs" },
];

export default function PublicHeader({ active }: PublicHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="DENTALG" className="h-7 w-auto" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={
                active === item.key
                  ? "font-semibold text-primary"
                  : "font-medium text-slate-600 transition-colors hover:text-slate-900"
              }
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="rounded-lg bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary-800"
          >
            Connexion pro
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={
                  active === item.key
                    ? "font-semibold text-primary"
                    : "font-medium text-slate-600"
                }
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-lg bg-primary px-4 py-2.5 text-center font-medium text-white"
            >
              Connexion pro
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
