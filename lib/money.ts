export const MAX_PRICE_MINOR = 100_000_000_000_000;
// Every currency supported by MotoLog currently uses two minor-unit digits.
export const SUPPORTED_CURRENCIES = ["USD", "GTQ", "MXN", "EUR", "GBP", "CAD"] as const;

const DECIMAL_AMOUNT = /^(\d+)(?:\.(\d{1,2}))?$/;

/** Parse a non-negative decimal amount with at most two fractional digits. */
export function parsePriceToMinor(value: string): number {
  const match = DECIMAL_AMOUNT.exec(value);
  if (!match) {
    throw new Error("El precio debe tener un máximo de dos decimales.");
  }

  const whole = Number(match[1]);
  const fraction = Number((match[2] ?? "").padEnd(2, "0") || "0");
  if (!Number.isSafeInteger(whole) || whole > 1_000_000_000_000) {
    throw new Error("El precio excede el máximo permitido.");
  }

  const minor = whole * 100 + fraction;
  if (!Number.isSafeInteger(minor) || minor > MAX_PRICE_MINOR) {
    throw new Error("El precio excede el máximo permitido.");
  }

  return minor;
}

/** Format integer minor units as a canonical decimal string with two places. */
export function formatPriceFromMinor(minor: number | null): string | null {
  if (minor === null) return null;
  if (!Number.isSafeInteger(minor) || minor < 0) {
    throw new Error("El precio almacenado no es un importe válido.");
  }

  const whole = Math.floor(minor / 100);
  const fraction = String(minor % 100).padStart(2, "0");
  return `${whole}.${fraction}`;
}

/** Convert legacy SQLite REAL values to cents using nearest-cent rounding. */
export function legacyPriceToMinor(price: number | null): number | null {
  if (price === null) return null;
  if (!Number.isFinite(price) || price < 0 || price > 1_000_000_000_000) {
    throw new Error("El precio heredado no es un importe válido.");
  }

  const minor = Math.round(price * 100);
  if (!Number.isSafeInteger(minor) || minor > MAX_PRICE_MINOR) {
    throw new Error("El precio heredado excede el máximo permitido.");
  }
  return minor;
}
