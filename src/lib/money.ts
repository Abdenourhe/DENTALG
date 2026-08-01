/**
 * Money utilities — all amounts stored as Int cents (1 DA = 100 centimes).
 */

export function toCents(da: number): number {
  return Math.round(da * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

export function formatDA(cents: number): string {
  const da = fromCents(cents);
  return (
    new Intl.NumberFormat("fr-DZ", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(da) + " DA"
  );
}

export function formatDAShort(cents: number): string {
  const da = fromCents(cents);
  return (
    new Intl.NumberFormat("fr-DZ", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(da) + " DA"
  );
}
