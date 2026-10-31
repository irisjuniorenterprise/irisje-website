// app/api/devis/route.ts
// Réception du formulaire de devis (page /devis) et envoi de l'email
// via le SMTP partagé des variables MAIL_* (voir .env.example).

import { z } from 'zod';
import { MailConfigError, sendFormMail } from '@/lib/mail';
import { checkRateLimit, clientIp } from '@/lib/rateLimit';
import { isPrestationValue, PRESTATIONS } from '@/lib/data/prestations';

// Libellés FR des prestations / budgets / délais pour le corps de l'email
// (valeurs envoyées par DevisForm.tsx, alignées sur lib/data/prestations.ts
// et les traductions de messages/fr.json)
const PRESTATION_LABELS: Record<string, string> = {
  [PRESTATIONS.web]: 'Développement web',
  [PRESTATIONS.mobile]: 'Développement mobile',
  [PRESTATIONS.chatbot]: 'Chatbot',
  [PRESTATIONS.branding]: 'Branding',
  [PRESTATIONS.community]: 'Community management',
  [PRESTATIONS.etudeMarche]: 'Étude de marché',
  [PRESTATIONS.etudeNotoriete]: 'Étude de notoriété',
  [PRESTATIONS.etudeSatisfaction]: 'Étude de satisfaction',
  [PRESTATIONS.businessPlan]: 'Business plan',
};

const BUDGET_LABELS: Record<string, string> = {
  'moins-500': 'Moins de 500 DT',
  '500-2000': '500 - 2 000 DT',
  '2000-5000': '2 000 - 5 000 DT',
  '5000-10000': '5 000 - 10 000 DT',
  'plus-10000': 'Plus de 10 000 DT',
};

const DELAI_LABELS: Record<string, string> = {
  '1-semaine': '1 semaine',
  '2-semaines': '2 semaines',
  '1-mois': '1 mois',
  '2-mois': '2 mois',
  '3-mois': '3 mois',
};

// Schéma serveur (miroir des règles de validation du formulaire client)
const devisSchema = z.object({
  nom: z.string().min(2).max(120),
  email: z.string().email().max(200),
  telephone: z.string().regex(/^[0-9]{8}$/),
  prestation: z.string().refine(isPrestationValue),
  budget: z.enum(['moins-500', '500-2000', '2000-5000', '5000-10000', 'plus-10000']),
  delai: z.string().max(50).optional(),
  description: z.string().max(5000).optional(),
  consentement: z.literal(true),
});

// 5 envois par IP et par tranche de 10 minutes (anti-spam, voir lib/rateLimit.ts)
const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };

export async function POST(request: Request) {
  const rate = checkRateLimit(`devis:${clientIp(request)}`, RATE_LIMIT);
  if (!rate.allowed) {
    return Response.json(
      { ok: false, error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec ?? 600) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const parsed = devisSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, error: 'validation' }, { status: 400 });
  }

  const data = parsed.data;
  const prestationLabel = PRESTATION_LABELS[data.prestation] ?? data.prestation;

  try {
    await sendFormMail({
      subject: `[Site IRIS] Demande de devis — ${prestationLabel}`,
      replyTo: data.email,
      fields: [
        { label: 'Nom', value: data.nom },
        { label: 'Email', value: data.email },
        { label: 'Téléphone', value: data.telephone },
        { label: 'Prestation', value: prestationLabel },
        { label: 'Budget', value: BUDGET_LABELS[data.budget] ?? data.budget },
        { label: 'Délai', value: DELAI_LABELS[data.delai ?? ''] ?? data.delai },
        { label: 'Description', value: data.description },
      ],
    });
  } catch (error) {
    if (error instanceof MailConfigError) {
      // Variables MAIL_* manquantes côté serveur → 503 explicite
      console.error(error.message);
      return Response.json({ ok: false, error: 'mail_config' }, { status: 503 });
    }
    console.error('[api/devis] échec de l’envoi SMTP :', error);
    return Response.json({ ok: false, error: 'mail_send' }, { status: 500 });
  }

  return Response.json({ ok: true });
}
