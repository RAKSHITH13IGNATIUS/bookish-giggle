/**
 * Centralized SEO & Domain Configuration
 * Reads process.env.SITE_URL (preferred) or process.env.NEXT_PUBLIC_SITE_URL.
 * Keeps preview and local development environments non-indexable to prevent accidental duplicate indexing.
 */

export function getProductionSiteUrl(): string | null {
  const url = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (!url) return null;

  const trimmed = url.trim().replace(/\/+$/, '');
  if (!trimmed) return null;

  return trimmed.startsWith('http://') || trimmed.startsWith('https://')
    ? trimmed
    : `https://${trimmed}`;
}

export function isProductionEnvironment(): boolean {
  if (process.env.VERCEL_ENV) {
    return process.env.VERCEL_ENV === 'production';
  }
  return process.env.NODE_ENV === 'production' && Boolean(getProductionSiteUrl());
}

/**
 * Returns canonical metadata object for a given path.
 * If no production URL is configured, returns undefined to avoid generating
 * localhost or unverified domain canonical tags.
 */
export function getCanonicalMetadata(pathname: string) {
  const baseUrl = getProductionSiteUrl();
  if (!baseUrl) return undefined;

  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  // Normalize trailing slash: standard no-trailing-slash convention except root
  const cleanPath = normalizedPath === '/' ? '' : normalizedPath.replace(/\/+$/, '');

  return {
    canonical: `${baseUrl}${cleanPath}`,
  };
}
