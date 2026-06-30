// proxy.ts
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n/config';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true,
});

export default function middleware(request: NextRequest): NextResponse {
  // Appel du middleware intl
  const response = intlMiddleware(request);
  
  // Si la réponse est une redirection, on la retourne directement
  if (response.status >= 300 && response.status < 400) {
    return response;
  }
  
  const pathname = request.nextUrl.pathname;
  const localeFromUrl = pathname.split('/')[1];
  
  // Ajout du header seulement si une locale valide est présente
  if (localeFromUrl && locales.includes(localeFromUrl as (typeof locales)[number])) {
    response.headers.set('x-locale', localeFromUrl);
  }
  
  return response;
}

export const config = {
  matcher: [
    // Inclure toutes les routes sauf celles spécifiées
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};