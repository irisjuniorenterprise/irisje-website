// components/forms/ContactForm.tsx
'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, type CSSProperties } from 'react';
import { useTranslations } from 'next-intl';
import { Icons } from '@/components/icons/Icons';
import ChoiceGroup from './ChoiceGroup';
import FormHeader from './FormHeader';
import { describedBy, focusFirstInvalid } from './formA11y';
import styles from './FormShared.module.css';

type ContactFormData = {
  nom: string;
  email: string;
  telephone: string;
  sujet: string;
  message?: string; // ✅ CHANGÉ : optionnel
  consentement: boolean;
};

type ContactFormProps = {
  locale: string;
};

export default function ContactForm({ locale }: ContactFormProps) {
  const t = useTranslations('ContactPage');
  const isRtl = locale === 'ar';

  // Schéma de validation avec messages traduits
  const getContactSchema = () => {
    return z.object({
      nom: z.string().min(2, t('errors.nom_min')),
      email: z.string().email(t('errors.email_invalid')),
      telephone: z.string().regex(/^[0-9]{8}$/, t('errors.telephone_format')),
      sujet: z.string().min(1, t('errors.sujet_required')),
      message: z.string().optional(), // ✅ CHANGÉ : plus obligatoire, devient optionnel
      consentement: z.boolean().refine((val) => val === true, {
        message: t('errors.consentement_required'),
      }),
    });
  };

  const contactSchema = getContactSchema();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      nom: '',
      email: '',
      telephone: '',
      sujet: '',
      message: '',
      consentement: false,
    },
  });

  // Ids des premiers contrôles de chaque champ, dans l'ordre visuel du
  // formulaire : après un envoi refusé, le focal va sur le premier champ en
  // erreur au lieu de rester figé sur le bouton d'envoi.
  const FIRST_CONTROL: Record<string, string> = {
    nom: 'contact-nom',
    email: 'contact-email',
    telephone: 'contact-telephone',
    sujet: 'contact-sujet-0',
    message: 'contact-message',
    consentement: 'contact-consentement',
  };

  const onSubmit: SubmitHandler<ContactFormData> = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      setSubmitSuccess(true);
      reset();
    } catch {
      setSubmitError(t('errors.general'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Options du choix du sujet
  const sujets = [
    { value: 'demande-information', label: t('sujets.information') },
    { value: 'devis', label: t('sujets.devis') },
    { value: 'partenariat', label: t('sujets.partenariat') },
    { value: 'sponsoring', label: t('sujets.sponsoring') },
    { value: 'autre', label: t('sujets.autre') },
  ];

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (errs) =>
        focusFirstInvalid(errs, FIRST_CONTROL),
      )}
      className={`${styles.form} ${isRtl ? styles.rtl : ''}`}
      noValidate
      dir={isRtl ? 'rtl' : 'ltr'}
      aria-labelledby="contact-form-title"
    >
      {/* EN-TÊTE : titre du formulaire */}
      <FormHeader
        id="contact-form-title"
        icon={<Icons.Mail size={26} />}
        title={t('form_header.title')}
        subtitle={t('form_header.subtitle')}
        requiredNote={t('form_header.required_note')}
      />

      {/* GROUPE 1 : Informations personnelles */}
      <fieldset className={styles.fieldset} style={{ '--i': 0 } as CSSProperties}>
        <legend className={styles.legend}>
          <Icons.PenDraw size={18} />
          {t('personal_info.title')}
        </legend>

        <div className={styles.field}>
          <div className={styles.inputWrapper}>
            <Icons.User size={20} className={styles.inputIcon} />
            <input
              id="contact-nom"
              type="text"
              required
              {...register('nom')}
              className={`${styles.input} ${errors.nom ? styles.invalid : ''}`}
              placeholder=" "
              aria-invalid={!!errors.nom}
              aria-describedby={describedBy(errors.nom && 'contact-nom-error')}
            />
            <label htmlFor="contact-nom" className={styles.floatingLabel}>
              {t('personal_info.nom')} *
            </label>
          </div>
          {errors.nom && (
            <p id="contact-nom-error" className={styles.error}>
              {errors.nom.message}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <div className={styles.inputWrapper}>
            <Icons.Mail size={20} className={styles.inputIcon} />
            <input
              id="contact-email"
              type="email"
              required
              {...register('email')}
              className={`${styles.input} ${errors.email ? styles.invalid : ''}`}
              placeholder=" "
              aria-invalid={!!errors.email}
              aria-describedby={describedBy(
                errors.email && 'contact-email-error',
              )}
            />
            <label htmlFor="contact-email" className={styles.floatingLabel}>
              {t('personal_info.email')} *
            </label>
          </div>
          {errors.email && (
            <p id="contact-email-error" className={styles.error}>
              {errors.email.message}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <div className={styles.inputWrapper}>
            <Icons.Phone size={20} className={styles.inputIcon} />
            <input
              id="contact-telephone"
              type="tel"
              required
              {...register('telephone')}
              className={`${styles.input} ${errors.telephone ? styles.invalid : ''}`}
              placeholder=" "
              aria-invalid={!!errors.telephone}
              aria-describedby={describedBy(
                'contact-telephone-help',
                errors.telephone && 'contact-telephone-error',
              )}
            />
            <label htmlFor="contact-telephone" className={styles.floatingLabel}>
              {t('personal_info.telephone')} *
            </label>
          </div>
          <small id="contact-telephone-help" className={styles.helper}>
            {t('personal_info.telephone_helper')}
          </small>
          {errors.telephone && (
            <p id="contact-telephone-error" className={styles.error}>
              {errors.telephone.message}
            </p>
          )}
        </div>
      </fieldset>

      {/* GROUPE 2 : Votre demande */}
      <fieldset className={styles.fieldset} style={{ '--i': 1 } as CSSProperties}>
        <legend className={styles.legend}>
          <Icons.Message size={18} />
          {t('demande.title')}
        </legend>

        <ChoiceGroup
          id="contact-sujet"
          label={t('demande.sujet')}
          icon={<Icons.HelpCircle size={18} />}
          options={sujets}
          registration={register('sujet')}
          error={errors.sujet?.message}
        />

        <div className={styles.field}>
          <div className={`${styles.inputWrapper} ${styles.textareaWrapper}`}>
            <Icons.Edit size={20} className={styles.inputIcon} />
            <textarea
              id="contact-message"
              rows={5}
              {...register('message')}
              className={`${styles.input} ${styles.textarea} ${errors.message ? styles.invalid : ''}`}
              placeholder=" "
              aria-invalid={!!errors.message}
              aria-describedby={describedBy(
                'contact-message-help',
                errors.message && 'contact-message-error',
              )}
            />
            <label htmlFor="contact-message" className={styles.floatingLabel}>
              {t('demande.message')} {/* ✅ Supprimé le * */}
            </label>
          </div>
          <small id="contact-message-help" className={styles.helper}>
            {t('demande.message_helper')}
          </small>
          {errors.message && (
            <p id="contact-message-error" className={styles.error}>
              {errors.message.message}
            </p>
          )}
        </div>
      </fieldset>

      {/* GROUPE 3 : Confidentialité */}
      <fieldset className={styles.fieldset} style={{ '--i': 2 } as CSSProperties}>
        <legend className={styles.legend}>
          <Icons.Shield size={18} />
          {t('privacy.title')}
        </legend>

        <div className={styles.checkboxField}>
          <label className={styles.checkboxLabel}>
            <input
              id="contact-consentement"
              type="checkbox"
              required
              {...register('consentement')}
              className={styles.checkbox}
              aria-invalid={!!errors.consentement}
              aria-describedby={describedBy(
                errors.consentement && 'contact-consentement-error',
              )}
            />
            <span className={styles.checkboxText}>
              {t('privacy.consent_text')}
              <br />
              <small>
                {t('privacy.consent_small')}{' '}
                <a href={`/${locale}/politique-confidentialite`} className={styles.link}>
                  {t('privacy.privacy_link')}
                </a>
                .
              </small>
            </span>
          </label>
          {errors.consentement && (
            <p id="contact-consentement-error" className={styles.error}>
              {errors.consentement.message}
            </p>
          )}
        </div>
      </fieldset>

      <button
        type="submit"
        className={`btn btn-cta ${styles.submitButton}`}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className={styles.spinner} aria-hidden="true"></span>
            {t('buttons.sending')}
          </>
        ) : (
          <>
            <Icons.Send size={18} />
            {t('buttons.submit')}
          </>
        )}
      </button>

      {/* Live regions : le résultat de l'envoi est annoncé sans voler le focal */}
      {submitSuccess && (
        <div className={styles.successMessage} role="status">
          <Icons.Check size={24} />
          <div>
            <strong>{t('success.title')}</strong>
            <p>{t('success.message')}</p>
          </div>
        </div>
      )}

      {submitError && (
        <div className={styles.errorMessage} role="alert">
          <Icons.Alert size={24} />
          <div>
            <strong>{t('error.title')}</strong>
            <p>{submitError}</p>
          </div>
        </div>
      )}
    </form>
  );
}
