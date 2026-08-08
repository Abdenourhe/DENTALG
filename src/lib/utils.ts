/**
 * Utility to merge tailwind classes without clsx/tailwind-merge dependency.
 * Filters out falsy values and joins with spaces.
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ");
}
