import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function generateNonce(): string {
  const array = new Uint8Array(16);
  // Prefer Web Crypto (available in Edge/middleware runtime)
  if (typeof globalThis?.crypto?.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(array);
  } else if (typeof Buffer !== 'undefined') {
    // fallback for Node (non-edge)
    const buf = Buffer.from(
      Array.from({ length: 16 }, () => Math.floor(Math.random() * 256))
    );
    return buf.toString('base64');
  } else {
    for (let i = 0; i < array.length; i++)
      array[i] = Math.floor(Math.random() * 256);
  }

  // base64-encode the random bytes
  try {
    if (typeof Buffer !== 'undefined')
      return Buffer.from(array).toString('base64');
    if (typeof btoa !== 'undefined') {
      let binary = '';
      for (let i = 0; i < array.length; i++)
        binary += String.fromCharCode(array[i]);
      return btoa(binary);
    }
  } catch (e) {
    // fallthrough to hex
  }

  // fallback hex string
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function middleware(req: NextRequest) {
  const isDev = process.env.NODE_ENV === 'development';

  // Build CSP - more permissive in development for hot reload
  const csp = isDev
    ? `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://plausible.io; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self' data:; connect-src 'self' https: wss: https://plausible.io https://api.resend.com https://raw.githack.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; worker-src 'self' blob:; child-src 'self' blob:; media-src 'self' blob: data:;`
    : `default-src 'self'; script-src 'self' 'unsafe-inline' https://plausible.io; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self' data:; connect-src 'self' https: https://plausible.io https://api.resend.com https://raw.githack.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; worker-src 'self' blob:; child-src 'self' blob:; media-src 'self' blob: data:; upgrade-insecure-requests;`;

  const res = NextResponse.next();

  // Set the CSP header
  res.headers.set('Content-Security-Policy', csp);

  return res;
}

export const config = {
  matcher: '/:path*',
};
