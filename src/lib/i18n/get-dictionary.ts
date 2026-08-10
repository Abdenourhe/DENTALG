import { ar, fr, type Dictionary } from "./dictionaries";

export type Locale = "fr" | "ar";

const dictionaries: Record<Locale, Dictionary> = {
  fr,
  ar,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? fr;
}
