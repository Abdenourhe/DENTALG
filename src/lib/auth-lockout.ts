const attempts = new Map<string, { count: number; lockedUntil?: number }>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

export function recordFailedAttempt(identifier: string): { locked: boolean; remaining: number } {
  const now = Date.now();
  const entry = attempts.get(identifier) ?? { count: 0 };

  if (entry.lockedUntil && entry.lockedUntil > now) {
    return { locked: true, remaining: 0 };
  }

  entry.count += 1;

  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_MS;
    entry.count = 0;
    attempts.set(identifier, entry);
    return { locked: true, remaining: 0 };
  }

  attempts.set(identifier, entry);
  return { locked: false, remaining: MAX_ATTEMPTS - entry.count };
}

export function isLocked(identifier: string): boolean {
  const now = Date.now();
  const entry = attempts.get(identifier);
  if (!entry?.lockedUntil) return false;
  if (entry.lockedUntil > now) return true;
  attempts.delete(identifier);
  return false;
}

export function resetAttempts(identifier: string): void {
  attempts.delete(identifier);
}
