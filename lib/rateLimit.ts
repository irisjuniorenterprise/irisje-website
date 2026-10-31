// lib/rateLimit.ts
// Limiteur de débit minimal (fenêtre glissante, en mémoire) pour les routes
// d'envoi d'email (contact, devis). Il freine le spam et l'abus du SMTP.
//
// ⚠️ Limite connue : l'état vit dans la mémoire de l'instance. Sur un
// déploiement serverless (Vercel), chaque instance a son compteur : la
// protection est partielle mais gratuite. Pour une protection stricte,
// remplacer par un store partagé (Upstash Redis, Vercel KV…) ou ajouter un
// captcha (Cloudflare Turnstile).

type Bucket = number[]; // horodatages (ms) des requêtes récentes

const buckets = new Map<string, Bucket>();
let lastSweep = 0;

export type RateLimitOptions = {
  /** Nombre maximal de requêtes autorisées dans la fenêtre. */
  limit: number;
  /** Durée de la fenêtre en millisecondes. */
  windowMs: number;
};

/** IP du visiteur (première adresse de x-forwarded-for, sinon x-real-ip). */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim() || 'unknown';
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

/**
 * Enregistre une requête pour `key` et indique si elle est autorisée.
 * `retryAfterSec` n'est renseigné que lorsque la requête est refusée.
 */
export function checkRateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();

  // Nettoyage occasionnel pour éviter une croissance illimitée de la Map.
  if (now - lastSweep > windowMs) {
    lastSweep = now;
    for (const [k, hits] of buckets) {
      if (hits.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }

  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    buckets.set(key, recent);
    const retryAfterSec = Math.ceil((recent[0] + windowMs - now) / 1000);
    return { allowed: false, retryAfterSec };
  }

  recent.push(now);
  buckets.set(key, recent);
  return { allowed: true };
}
