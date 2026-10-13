// app/api/contact/route.ts
// Réception du formulaire de contact (page /contact) et envoi de l'email
// via le SMTP configuré avec les variables CONTACT_* (voir .env.example).

import { z } from 'zod';
import { MailConfigError, sendFormMail } from '@/lib/mail';

// Sujets proposés par ContactForm.tsx (libellés FR pour l'email)
const SUJETS: Record<string, string> = {
  'demande-information': 'Demande d’information',
  devis: 'Demande de devis',
  partenariat: 'Partenariat',
  sponsoring: 'Sponsoring',
  autre: 'Autre demande',
};

// Schéma serveur (miroir des règles de validation du formulaire client)
const contactSchema = z.object({
  nom: z.string().min(2).max(120),
  email: z.string().email().max(200),
  telephone: z.string().regex(/^[0-9]{8}$/),
  sujet: z.enum(['demande-information', 'devis', 'partenariat', 'sponsoring', 'autre']),
  message: z.string().max(5000).optional(),
  consentement: z.literal(true),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, error: 'validation' }, { status: 400 });
  }

  const data = parsed.data;
  const sujetLabel = SUJETS[data.sujet] ?? data.sujet;

  try {
    await sendFormMail('contact', {
      subject: `[Site IRIS] Contact — ${sujetLabel}`,
      replyTo: data.email,
      fields: [
        { label: 'Nom', value: data.nom },
        { label: 'Email', value: data.email },
        { label: 'Téléphone', value: data.telephone },
        { label: 'Sujet', value: sujetLabel },
        { label: 'Message', value: data.message },
      ],
    });
  } catch (error) {
    if (error instanceof MailConfigError) {
      // Variables CONTACT_* manquantes côté serveur → 503 explicite
      console.error(error.message);
      return Response.json({ ok: false, error: 'mail_config' }, { status: 503 });
    }
    console.error('[api/contact] échec de l’envoi SMTP :', error);
    return Response.json({ ok: false, error: 'mail_send' }, { status: 500 });
  }

  return Response.json({ ok: true });
}
