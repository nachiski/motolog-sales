export const MOTORCYCLE_BRANDS = ["YADEA", "YAMAHA", "GENESIS", "HERO", "MOTOR MARINO"] as const;
export const SALES_LOCATIONS = ["TIPITAPA", "GRANADA"] as const;
export const normalizeSaleValue = (value: string) => value.trim().toUpperCase();
