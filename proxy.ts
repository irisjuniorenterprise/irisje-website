// proxy.ts
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n/config';
import { canonicalHostFor, normalizeHost } from './lib/seo';

// Middleware next-intl officiel
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true
});

const isLocalHost = (host: string): boolean =>
  host === '' ||
  host === 'localhost' ||
  host.endsWith('.localhost') ||
  /^\d{1,3}(\.\d{1,3}){3}$/.test(host);

export default function middleware(request: NextRequest) {
  const host = normalizeHost(
    request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  );

  // 🔁 Un seul hôte par domaine : iris-junior-entreprise.com → www.… (308).
  // Sans cela, apex et www se concurrencent (contenu dupliqué) et l'URL
  // auditée ≠ l'URL canonique (alerte Lighthouse « canonical invalide »).
  const canonicalHost = canonicalHostFor(host);
  if (canonicalHost && canonicalHost !== host) {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    url.hostname = canonicalHost;
    url.port = '';
    return NextResponse.redirect(url, 308);
  }

  // 🚫 Hôte hors production (preview, *.vercel.app…) : jamais indexé.
  const noindex = !canonicalHost && !isLocalHost(host);
  const finish = (response: NextResponse): NextResponse => {
    if (noindex) response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  };

  const { pathname } = request.nextUrl;

  // 🚫 Ignorer fichiers statiques + assets + API
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') // fichiers (images, css, js, etc.)
  ) {
    return finish(NextResponse.next());
  }

  // ✅ Appliquer next-intl
  const response = intlMiddleware(request);

  // ⚠️ IMPORTANT : ne JAMAIS casser le flux pour les 404
  // → on ne modifie PAS la réponse si ce n’est pas nécessaire

  // ✅ Optionnel (safe) : ajouter header locale sans casser 404
  const localeFromUrl = pathname.split('/')[1];

  if (
    localeFromUrl &&
    locales.includes(localeFromUrl as (typeof locales)[number]) &&
    response.status === 200 // ⚠️ très important
  ) {
    response.headers.set('x-locale', localeFromUrl);
  }

  return finish(response);
}

export const config = {
  matcher: [
    // matcher propre et safe
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'
  ]
};