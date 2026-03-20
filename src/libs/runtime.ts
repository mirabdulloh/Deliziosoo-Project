import { Request } from "express";

const DEFAULT_DEV_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"];
const VALID_SAME_SITE_VALUES = ["lax", "strict", "none"] as const;

export const isProduction = process.env.NODE_ENV === "production";

const parseBooleanEnv = (value?: string): boolean | undefined => {
  if (value == null) return undefined;

  const normalized = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;

  return undefined;
};

export const getConfiguredOrigins = (): string[] => {
  const rawOrigins =
    process.env.CLIENT_ORIGINS ||
    process.env.CLIENT_ORIGIN ||
    process.env.CLIENT_URL ||
    "";

  return rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const getAllowedOrigins = (): string[] => {
  const configuredOrigins = getConfiguredOrigins();
  return configuredOrigins.length > 0 ? configuredOrigins : DEFAULT_DEV_ORIGINS;
};

export const getCookieSecure = (): boolean => {
  const override = parseBooleanEnv(process.env.COOKIE_SECURE);
  return override ?? isProduction;
};

export const getCookieSameSite = (): "lax" | "strict" | "none" => {
  const override = process.env.COOKIE_SAME_SITE?.trim().toLowerCase();

  if (override && VALID_SAME_SITE_VALUES.includes(override as any)) {
    return override as "lax" | "strict" | "none";
  }

  return getCookieSecure() ? "none" : "lax";
};

export const isLocalDevOrigin = (origin: string): boolean => {
  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  } catch {
    return false;
  }
};

export const getServerBaseUrl = (req?: Request): string => {
  const configuredBaseUrl = process.env.SERVER_API?.trim();

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/+$/, "");
  }

  if (!req) {
    const port = process.env.PORT ?? "3003";
    return `http://localhost:${port}`;
  }

  const protocol = req.protocol;
  const host = req.get("host");

  return host ? `${protocol}://${host}` : `http://localhost:${process.env.PORT ?? "3003"}`;
};
