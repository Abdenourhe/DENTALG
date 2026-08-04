import { Clinic } from "@prisma/client";

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

export function getEnabledFeatures(
  clinic: Pick<Clinic, "features">,
): FeatureKey[] {
  const features = (clinic.features ?? {}) as Record<string, boolean>;
  return Object.keys(AVAILABLE_FEATURES).filter(
    (k) => features[k] === true,
  ) as FeatureKey[];
}

export function isFeatureEnabled(
  clinic: Pick<Clinic, "features">,
  feature: FeatureKey,
): boolean {
  const features = (clinic.features ?? {}) as Record<string, boolean>;
  return features[feature] === true;
}

export function setFeatureEnabled(
  features: Record<string, boolean>,
  feature: FeatureKey,
  enabled: boolean,
): Record<string, boolean> {
  return { ...features, [feature]: enabled };
}
