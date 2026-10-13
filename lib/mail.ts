// lib/mail.ts
// Envoi des emails de formulaire via SMTP.
//
// Chaque formulaire possède sa propre configuration (variables d'env dédiées,
// voir .env.example) — chacun peut ainsi adresser sa propre boîte :
//   contact -> CONTACT_SMTP_HOST / _PORT / _SECURE / _USER / _PASS
//              CONTACT_MAIL_FROM / CONTACT_MAIL_TO
//   devis   -> DEVIS_SMTP_* et DEVIS_MAIL_*
//
// Les variables sont lues à chaque envoi (pas de figement au démarrage),
// ainsi un changement dans .env.local est pris en compte au prochain submit.

import nodemailer from 'nodemailer';

export type MailForm = 'contact' | 'devis';

/** Erreur levée quand la configuration SMTP d'un formulaire est incomplète/invalid. */
export class MailConfigError extends Error {
  constructor(form: MailForm, problems: string[]) {
    super(
      `[mail] Configuration SMTP invalide pour le formulaire « ${form} » : ${problems.join(', ')}`,
    );
    this.name = 'MailConfigError';
  }
}

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  auth: { user: string; pass: string };
  from: string;
  to: string;
};

/** Lit la configuration SMTP d'un formulaire dans les variables d'environnement. */
export function getSmtpConfig(form: MailForm): SmtpConfig {
  const prefix = form.toUpperCase(); // CONTACT | DEVIS

  const host = process.env[`${prefix}_SMTP_HOST`];
  const port = process.env[`${prefix}_SMTP_PORT`];
  const secure = process.env[`${prefix}_SMTP_SECURE`];
  const user = process.env[`${prefix}_SMTP_USER`];
  const pass = process.env[`${prefix}_SMTP_PASS`];
  const from = process.env[`${prefix}_MAIL_FROM`];
  const to = process.env[`${prefix}_MAIL_TO`];

  const problems: string[] = [];
  if (!host) problems.push(`${prefix}_SMTP_HOST`);
  if (!port) problems.push(`${prefix}_SMTP_PORT`);
  if (!user) problems.push(`${prefix}_SMTP_USER`);
  if (!pass) problems.push(`${prefix}_SMTP_PASS`);
  if (!from) problems.push(`${prefix}_MAIL_FROM`);
  if (!to) problems.push(`${prefix}_MAIL_TO`);

  const parsedPort = Number(port);
  if (port && (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65535)) {
    problems.push(`${prefix}_SMTP_PORT (« ${port} » n'est pas un port valide)`);
  }

  if (problems.length > 0) throw new MailConfigError(form, problems);

  return {
    host: host as string,
    port: parsedPort,
    secure: secure === 'true',
    auth: { user: user as string, pass: pass as string },
    from: from as string,
    to: to as string,
  };
}

/** Échappe les caractères spéciaux HTML (saisies utilisateur injectées dans le mail). */
const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export type FormMailPayload = {
  /** Sujet de l'email (ex. « [Site IRIS] Contact — Partenariat ») */
  subject: string;
  /** Libellés des champs, dans l'ordre d'affichage (les valeurs vides sont ignorées) */
  fields: Array<{ label: string; value?: string }>;
  /** Email du visiteur, renseigné en replyTo pour répondre directement */
  replyTo: string;
};

/** Construit le corps HTML du mail (table libellé/valeur aux couleurs de la charte). */
function buildHtml(fields: FormMailPayload['fields']): string {
  const rows = fields
    .filter((field) => field.value && field.value.trim() !== '')
    .map(
      (field) => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:13px;vertical-align:top;white-space:nowrap;">${escapeHtml(field.label)}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#1f2937;font-size:14px;">${escapeHtml(field.value as string).replace(/\n/g, '<br>')}</td>
        </tr>`,
    )
    .join('');

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;">
      <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        <tbody>${rows}</tbody>
      </table>
      <p style="color:#9ca3af;font-size:12px;margin:12px 4px 0;">Email envoyé depuis le site IRIS Junior Entreprise.</p>
    </div>`.trim();
}

/** Envoie l'email d'un formulaire via le SMTP configuré pour ce formulaire. */
export async function sendFormMail(form: MailForm, payload: FormMailPayload): Promise<void> {
  const config = getSmtpConfig(form);

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

  await transporter.sendMail({
    from: config.from,
    to: config.to,
    replyTo: payload.replyTo,
    subject: payload.subject,
    html: buildHtml(payload.fields),
  });
}
