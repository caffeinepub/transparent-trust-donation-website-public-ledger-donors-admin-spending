// Site-wide configuration constants
// Centralized domain and branding configuration for easy maintenance

/**
 * The canonical domain for the site
 * Used in meta tags, share links, and external integrations
 */
export const SITE_DOMAIN = 'https://whynotus.org.in';

/**
 * Site name used throughout the application
 */
export const SITE_NAME = 'Why Not Us ?';

/**
 * Site tagline
 */
export const SITE_TAGLINE = 'Transparent Trust Platform';

/**
 * Environment detection
 */
export const isDevelopment = import.meta.env.MODE === 'development';
export const isProduction = import.meta.env.MODE === 'production';

/**
 * Get the appropriate base URL based on environment
 * In development, uses localhost; in production, uses the canonical domain
 */
export function getBaseUrl(): string {
  if (isDevelopment && typeof window !== 'undefined') {
    return window.location.origin;
  }
  return SITE_DOMAIN;
}

/**
 * Build an absolute URL from a relative path
 * @param path - Relative path (e.g., '/donate', '/about')
 * @returns Absolute URL
 */
export function getCanonicalUrl(path: string): string {
  const base = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

/**
 * Get the canister ID from the current hostname
 * Used for DNS configuration instructions
 */
export function getCanisterId(): string {
  if (typeof window === 'undefined') return 'unknown';
  
  const hostname = window.location.hostname;
  
  // If on icp0.io domain, extract canister ID
  if (hostname.includes('.icp0.io')) {
    return hostname.split('.')[0];
  }
  
  // If on custom domain or localhost, try to get from env or config
  // Fallback to a placeholder
  return import.meta.env.VITE_CANISTER_ID || 'your-canister-id';
}
