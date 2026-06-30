// proxy.ts
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n/config';

// Middleware next-intl officiel
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 🚫 Ignorer fichiers statiques + assets + API
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') // fichiers (images, css, js, etc.)
  ) {
    return NextResponse.next();
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

  return response;
}

export const config = {
  matcher: [
    // matcher propre et safe
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'
  ]
};