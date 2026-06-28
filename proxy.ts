// proxy.ts
import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n/config';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true,
});

export default function middleware(request: NextRequest): NextResponse {
  const response = intlMiddleware(request) as NextResponse;

  const pathname = request.nextUrl.pathname;
  const localeFromUrl = pathname.split('/')[1];

  if (locales.includes(localeFromUrl as any)) {
    response.headers.set('x-locale', localeFromUrl);
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};