import dns from 'dns/promises';
import net from 'net';
import { AppError } from '@shared/errors';

/**
 * SSRF guard for website-training URLs.
 *
 * We block any attempt to reach internal infrastructure (loopback, link-local,
 * private RFC1918 ranges, cloud metadata, etc.) both at validation time AND
 * after DNS resolution, so a public hostname that resolves to a private IP
 * (DNS-rebinding) is still rejected.
 */

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'ip6-localhost',
  'ip6-loopback',
  'metadata',
  'metadata.google.internal',
]);

/**
 * Returns true when an IP address (v4 or v6) belongs to a private, loopback,
 * link-local, or otherwise non-public range.
 */
export function isPrivateIp(ip: string): boolean {
  const type = net.isIP(ip);

  if (type === 4) {
    const parts = ip.split('.').map((part) => parseInt(part, 10));
    if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
      return true;
    }
    const [a, b] = parts as [number, number, number, number];

    if (a === 0) return true; // "this" network
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 127) return true; // loopback
    if (a === 169 && b === 254) return true; // link-local + cloud metadata 169.254.169.254
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 CGNAT
    if (a >= 224) return true; // multicast + reserved
    return false;
  }

  if (type === 6) {
    const normalized = ip.toLowerCase();

    if (normalized === '::' || normalized === '::1') return true; // unspecified + loopback
    if (normalized.startsWith('fe80')) return true; // link-local
    if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true; // unique local fc00::/7
    if (normalized.startsWith('ff')) return true; // multicast

    // IPv4-mapped IPv6 (e.g. ::ffff:10.0.0.1) — re-check the embedded v4 address.
    const mapped = normalized.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped?.[1]) {
      return isPrivateIp(mapped[1]);
    }

    return false;
  }

  // Not a valid IP literal.
  return true;
}

export interface ValidatedUrl {
  url: string;
  hostname: string;
  origin: string;
}

/**
 * Validate a single URL string and confirm it resolves to a public IP address.
 * Throws an AppError (400) for any unsafe or malformed input.
 */
export async function assertSafePublicUrl(rawUrl: string): Promise<ValidatedUrl> {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) {
    throw new AppError('A website URL is required', 400, 'INVALID_URL');
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new AppError('The provided URL is not valid', 400, 'INVALID_URL');
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    throw new AppError('Only http and https URLs are allowed', 400, 'INVALID_URL_PROTOCOL');
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');

  if (!hostname) {
    throw new AppError('The provided URL has no host', 400, 'INVALID_URL');
  }

  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    throw new AppError('This URL points to a private network and is not allowed', 400, 'URL_NOT_ALLOWED');
  }

  // If the host is already an IP literal, validate it directly.
  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      throw new AppError('This URL points to a private network and is not allowed', 400, 'URL_NOT_ALLOWED');
    }
  } else {
    // Resolve the hostname and ensure every resolved address is public.
    let addresses: { address: string }[];
    try {
      addresses = await dns.lookup(hostname, { all: true });
    } catch {
      throw new AppError('The website host could not be resolved', 400, 'URL_DNS_FAILED');
    }

    if (addresses.length === 0) {
      throw new AppError('The website host could not be resolved', 400, 'URL_DNS_FAILED');
    }

    for (const { address } of addresses) {
      if (isPrivateIp(address)) {
        throw new AppError(
          'This URL resolves to a private network and is not allowed',
          400,
          'URL_NOT_ALLOWED',
        );
      }
    }
  }

  return {
    url: parsed.toString(),
    hostname,
    origin: parsed.origin,
  };
}
