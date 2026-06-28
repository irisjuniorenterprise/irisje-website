// components/forms/ContactForm.tsx
'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Icons } from '@/components/icons/Icons';
import styles from './ContactForm.module.css';

type ContactFormData = {
  nom: string;
  email: string;
  telephone: string;
  sujet: string;
  message: string;
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
      message: z.string().min(10, t('errors.message_min')),
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

  const onSubmit: SubmitHandler<ContactFormData> = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Données du formulaire :', data);
      setSubmitSuccess(true);
      reset();
    } catch {
      setSubmitError(t('errors.general'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Options du select
  const sujets = [
    { value: 'demande-information', label: t('sujets.information') },
    { value: 'devis', label: t('sujets.devis') },
    { value: 'partenariat', label: t('sujets.partenariat') },
    { value: 'sponsoring', label: t('sujets.sponsoring') },
    { value: 'autre', label: t('sujets.autre') },
  ];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`${styles.form} ${isRtl ? styles.rtl : ''}`}
      noValidate
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* GROUPE 1 : Informations personnelles */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>
          <Icons.User size={18} />
          {t('personal_info.title')}
        </legend>

        <div className={styles.field}>
          <div className={styles.inputWrapper}>
            <Icons.User size={20} className={styles.inputIcon} />
            <input
              id="contact-nom"
              type="text"
              {...register('nom')}
              className={`${styles.input} ${errors.nom ? styles.invalid : ''}`}
              placeholder=" "
              aria-invalid={!!errors.nom}
            />
            <label htmlFor="contact-nom" className={styles.floatingLabel}>
              {t('personal_info.nom')} *
            </label>
          </div>
          {errors.nom && <p className={styles.error}>{errors.nom.message}</p>}
        </div>

        <div className={styles.field}>
          <div className={styles.inputWrapper}>
            <Icons.Mail size={20} className={styles.inputIcon} />
            <input
              id="contact-email"
              type="email"
              {...register('email')}
              className={`${styles.input} ${errors.email ? styles.invalid : ''}`}
              placeholder=" "
              aria-invalid={!!errors.email}
            />
            <label htmlFor="contact-email" className={styles.floatingLabel}>
              {t('personal_info.email')} *
            </label>
          </div>
          {errors.email && <p className={styles.error}>{errors.email.message}</p>}
        </div>

        <div className={styles.field}>
          <div className={styles.inputWrapper}>
            <Icons.Phone size={20} className={styles.inputIcon} />
            <input
              id="contact-telephone"
              type="tel"
              {...register('telephone')}
              className={`${styles.input} ${errors.telephone ? styles.invalid : ''}`}
              placeholder=" "
              aria-invalid={!!errors.telephone}
            />
            <label htmlFor="contact-telephone" className={styles.floatingLabel}>
              {t('personal_info.telephone')} *
            </label>
          </div>
          <small className={styles.helper}>{t('personal_info.telephone_helper')}</small>
          {errors.telephone && <p className={styles.error}>{errors.telephone.message}</p>}
        </div>
      </fieldset>

      {/* GROUPE 2 : Votre demande */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>
          <Icons.Message size={18} />
          {t('demande.title')}
        </legend>

        <div className={styles.field}>
          <div className={styles.inputWrapper}>
            <Icons.ChevronDown size={20} className={styles.inputIcon} />
            <select
              id="contact-sujet"
              {...register('sujet')}
              className={`${styles.input} ${styles.select} ${errors.sujet ? styles.invalid : ''}`}
              aria-invalid={!!errors.sujet}
            >
              <option value="">{t('demande.select_sujet')}</option>
              {sujets.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <label htmlFor="contact-sujet" className={styles.floatingLabel}>
              {t('demande.sujet')} *
            </label>
          </div>
          {errors.sujet && <p className={styles.error}>{errors.sujet.message}</p>}
        </div>

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
            />
            <label htmlFor="contact-message" className={styles.floatingLabel}>
              {t('demande.message')} *
            </label>
          </div>
          <small className={styles.helper}>{t('demande.message_helper')}</small>
          {errors.message && <p className={styles.error}>{errors.message.message}</p>}
        </div>
      </fieldset>

      {/* GROUPE 3 : Confidentialité */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>
          <Icons.Shield size={18} />
          {t('privacy.title')}
        </legend>

        <div className={styles.checkboxField}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              {...register('consentement')}
              className={styles.checkbox}
              aria-invalid={!!errors.consentement}
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
          {errors.consentement && <p className={styles.error}>{errors.consentement.message}</p>}
        </div>
      </fieldset>

      <button
        type="submit"
        className={`btn btn-cta ${styles.submitButton}`}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className={styles.spinner}></span>
            {t('buttons.sending')}
          </>
        ) : (
          <>
            <Icons.Send size={18} />
            {t('buttons.submit')}
          </>
        )}
      </button>

      {submitSuccess && (
        <div className={styles.successMessage}>
          <Icons.Check size={24} />
          <div>
            <strong>{t('success.title')}</strong>
            <p>{t('success.message')}</p>
          </div>
        </div>
      )}

      {submitError && (
        <div className={styles.errorMessage}>
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