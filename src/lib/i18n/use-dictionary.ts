"use client";

import { useEffect, useState } from "react";
import { getDictionary, type Locale } from "./get-dictionary";

const STORAGE_KEY = "dentalg_locale";

export function useDictionary() {
  const [locale, setLocale] = useState<Locale>("fr");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "fr" || stored === "ar") {
      setLocale(stored);
    }
  }, []);

  function setLocaleAndStore(next: Locale) {
    localStorage.setItem(STORAGE_KEY, next);
    setLocale(next);
  }

  return {
    locale,
    setLocale: setLocaleAndStore,
    t: getDictionary(locale),
    dir: locale === "ar" ? ("rtl" as const) : ("ltr" as const),
  };
}

export type { Locale };
