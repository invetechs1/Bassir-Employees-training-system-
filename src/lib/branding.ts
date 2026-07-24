/** Per-tenant branding helpers (color + logo), with safe defaults. */

export const DEFAULT_BRAND_COLOR = "#2953d9";

/** Validate a hex color (#rgb or #rrggbb); fall back to the default brand. */
export function normalizeHex(input: string | null | undefined): string {
  if (!input) return DEFAULT_BRAND_COLOR;
  const v = input.trim();
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v) ? v : DEFAULT_BRAND_COLOR;
}

/** Only allow http(s) logo URLs (used in <img> and emails). */
export function safeLogoUrl(input: string | null | undefined): string | null {
  if (!input) return null;
  const v = input.trim();
  return /^https?:\/\/\S+$/i.test(v) ? v : null;
}

export interface Branding {
  color: string;
  logoUrl: string | null;
  name: string;
  initial: string;
}

export function brandingOf(tenant: {
  name: string;
  brandColor?: string | null;
  logoUrl?: string | null;
}): Branding {
  return {
    color: normalizeHex(tenant.brandColor),
    logoUrl: safeLogoUrl(tenant.logoUrl),
    name: tenant.name,
    initial: (tenant.name?.[0] ?? "B").toUpperCase(),
  };
}
