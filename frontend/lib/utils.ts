import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBackendAssetUrl(path: string): string {
  if (!path?.trim()) return '';
  if (/^https?:\/\//i.test(path) || path.startsWith('blob:')) return path;

  const normalized = path.startsWith('/') ? path : `/${path}`;

  // In the browser, use same-origin paths (proxied via Next.js rewrites in dev/prod)
  if (typeof window !== 'undefined') {
    return normalized;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
  const baseUrl = apiUrl.replace(/\/api\/?$/, '');
  return `${baseUrl}${normalized}`;
}

export function resolveAvatarUrl(avatarUrl?: string | null): string | null {
  const trimmed = avatarUrl?.trim();
  if (!trimmed) return null;
  return getBackendAssetUrl(trimmed);
}

/** Detect if text contains Arabic/Urdu script for RTL rendering */
export function isRtlText(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
}
