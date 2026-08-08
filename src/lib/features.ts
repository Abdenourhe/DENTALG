export const AVAILABLE_FEATURES = {
  LAB_ORDERS: {
    label: "Bons de labo",
    description: "Gestion des bons de laboratoire et résultats",
    route: "/lab",
  },
  PRESCRIPTIONS: {
    label: "Ordonnances",
    description: "Prescriptions médicales",
    route: "/prescriptions",
  },
  INVOICING: {
    label: "Facturation",
    description: "Devis, factures et paiements",
    route: "/billing",
  },
  JOB_OFFERS: {
    label: "Carrières",
    description: "Offres d'emploi internes",
    route: "/carrieres",
  },
  ANALYTICS: {
    label: "Analyses",
    description: "Tableaux de bord avancés",
    route: "/dashboard",
  },
  TREATMENT_PLANS: {
    label: "Plans de traitement",
    description: "Plans détaillés par patient",
    route: "/patients",
  },
} as const;

export type FeatureKey = keyof typeof AVAILABLE_FEATURES;

export function isFeatureEnabled(
  features: Record<string, boolean> | null | undefined,
  key: FeatureKey,
): boolean {
  if (!features) return false;
  return features[key] === true;
}
