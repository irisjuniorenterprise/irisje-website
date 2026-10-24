// proxy.ts
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n/config';
import { ROUTES, canonicalHostFor, isLocale, normalizeHost } from './lib/seo';

// Middleware next-intl officiel
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true,
  // Le hreflang est déjà déclaré dans le HTML et le sitemap (lib/seo.ts), avec
  // les deux domaines et les variantes fr-TN / en-TN / ar-TN. L'en-tête HTTP
  // `Link` ajouté par défaut par next-intl ne connaît que le domaine visité :
  // il contredirait ces annotations sur le .tn.
  alternateLinks: false
});

const isLocalHost = (host: string): boolean =>
  host === '' ||
  host === 'localhost' ||
  host.endsWith('.localhost') ||
  /^\d{1,3}(\.\d{1,3}){3}$/.test(host);

// Chemins (hors préfixe de langue) servis par l'application. /recrutement est
// redirigé en 308 par next.config.js avant d'arriver ici : il reste listé par
// prudence. Une nouvelle page ajoutée dans ROUTES est reconnue automatiquement.
const KNOWN_SUBPATHS = new Set<string>([
  ...ROUTES.map((route) => route.path).filter((path) => path !== '/'),
  '/recrutement'
]);

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

  // 🧭 Vrai 404 pour les URL inconnues sous un préfixe de langue valide.
  // Le layout [locale] enveloppe la page dans un <Suspense> (écran de
  // chargement) : le statut HTTP part donc AVANT que notFound() ne soit
  // appelé et une URL inexistante répondait « 200 » (soft 404). On répond
  // ici en 404 avec la même page not-found.tsx (design inchangé).
  const [firstSegment, ...restSegments] = pathname.split('/').filter(Boolean);
  if (firstSegment && isLocale(firstSegment) && restSegments.length > 0) {
    const subPath = `/${restSegments.join('/')}`;
    if (!KNOWN_SUBPATHS.has(subPath)) {
      const forwarded = new Headers(request.headers);
      forwarded.set('x-next-intl-locale', firstSegment);
      return finish(
        NextResponse.rewrite(new URL('/_not-found', request.url), {
          status: 404,
          request: { headers: forwarded }
        })
      );
    }
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