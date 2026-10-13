// components/forms/DevisForm.tsx
'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, type CSSProperties } from 'react';
import { useTranslations } from 'next-intl';
import { Icons } from '@/components/icons/Icons';
import ChoiceGroup from './ChoiceGroup';
import FormHeader from './FormHeader';
import { PRESTATIONS, type PrestationValue } from '@/lib/data/prestations';
import styles from './FormShared.module.css';

type DevisFormData = {
  nom: string;
  email: string;
  telephone: string;
  prestation: string;
  budget: string;
  delai?: string;
  description?: string; // ✅ CHANGÉ : optionnel
  consentement: boolean;
};

type DevisFormProps = {
  locale: string;
  /** Prestation présélectionnée (ex. depuis un clic sur la page Services) */
  defaultPrestation?: PrestationValue;
};

export default function DevisForm({ locale, defaultPrestation }: DevisFormProps) {
  const t = useTranslations('DevisPage');
  const tCommon = useTranslations('Common');
  const isRtl = locale === 'ar';

  // Schéma de validation avec messages traduits
  const getDevisSchema = () => {
    return z.object({
      nom: z.string().min(2, t('errors.nom_min')),
      email: z.string().email(t('errors.email_invalid')),
      telephone: z.string().regex(/^[0-9]{8}$/, t('errors.telephone_format')),
      prestation: z.string().min(1, t('errors.prestation_required')),
      budget: z.string().min(1, t('errors.budget_required')),
      delai: z.string().optional(), // champ « délai » actuellement masqué dans le formulaire
      description: z.string().optional(), // ✅ CHANGÉ : plus obligatoire, devient optionnel
      consentement: z.boolean().refine((val) => val === true, {
        message: t('errors.consentement_required'),
      }),
    });
  };

  const devisSchema = getDevisSchema();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DevisFormData>({
    resolver: zodResolver(devisSchema),
    defaultValues: {
      nom: '',
      email: '',
      telephone: '',
      prestation: defaultPrestation ?? '',
      budget: '',
      delai: '',
      description: '',
      consentement: false,
    },
  });

  const onSubmit: SubmitHandler<DevisFormData> = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const res = await fetch('/api/devis', {
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

  // Options des selects (dynamiques)
  const prestations = [
    { value: PRESTATIONS.web, label: t('prestations.web') },
    { value: PRESTATIONS.mobile, label: t('prestations.mobile') },
    { value: PRESTATIONS.chatbot, label: t('prestations.chatbot') },
    { value: PRESTATIONS.branding, label: t('prestations.branding') },
    { value: PRESTATIONS.community, label: t('prestations.community') },
    { value: PRESTATIONS.etudeMarche, label: t('prestations.etude_marche') },
    { value: PRESTATIONS.etudeNotoriete, label: t('prestations.etude_notoriete') },
    { value: PRESTATIONS.etudeSatisfaction, label: t('prestations.etude_satisfaction') },
    { value: PRESTATIONS.businessPlan, label: t('prestations.business_plan') },
    /* { value: 'autre', label: t('prestations.autre') }, */
  ];

  const budgets = [
    { value: 'moins-500', label: t('budgets.moins_500') },
    { value: '500-2000', label: t('budgets.500_2000') },
    { value: '2000-5000', label: t('budgets.2000_5000') },
    { value: '5000-10000', label: t('budgets.5000_10000') },
    { value: 'plus-10000', label: t('budgets.plus_10000') },
  ];

  const delais = [
    { value: '1-semaine', label: t('delais.1_semaine') },
    { value: '2-semaines', label: t('delais.2_semaines') },
    { value: '1-mois', label: t('delais.1_mois') },
    { value: '2-mois', label: t('delais.2_mois') },
    { value: '3-mois', label: t('delais.3_mois') },
  ];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`${styles.form} ${isRtl ? styles.rtl : ''}`}
      noValidate
      dir={isRtl ? 'rtl' : 'ltr'}
      aria-labelledby="devis-form-title"
    >
      {/* EN-TÊTE : titre du formulaire */}
      <FormHeader
        id="devis-form-title"
        icon={<Icons.Briefcase size={26} />}
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
              id="devis-nom"
              type="text"
              {...register('nom')}
              className={`${styles.input} ${errors.nom ? styles.invalid : ''}`}
              placeholder=" "
              aria-invalid={!!errors.nom}
            />
            <label htmlFor="devis-nom" className={styles.floatingLabel}>
              {t('personal_info.nom')} *
            </label>
          </div>
          {errors.nom && <p className={styles.error}>{errors.nom.message}</p>}
        </div>

        <div className={styles.field}>
          <div className={styles.inputWrapper}>
            <Icons.Mail size={20} className={styles.inputIcon} />
            <input
              id="devis-email"
              type="email"
              {...register('email')}
              className={`${styles.input} ${errors.email ? styles.invalid : ''}`}
              placeholder=" "
              aria-invalid={!!errors.email}
            />
            <label htmlFor="devis-email" className={styles.floatingLabel}>
              {t('personal_info.email')} *
            </label>
          </div>
          {errors.email && <p className={styles.error}>{errors.email.message}</p>}
        </div>

        <div className={styles.field}>
          <div className={styles.inputWrapper}>
            <Icons.Phone size={20} className={styles.inputIcon} />
            <input
              id="devis-telephone"
              type="tel"
              {...register('telephone')}
              className={`${styles.input} ${errors.telephone ? styles.invalid : ''}`}
              placeholder=" "
              aria-invalid={!!errors.telephone}
            />
            <label htmlFor="devis-telephone" className={styles.floatingLabel}>
              {t('personal_info.telephone')} *
            </label>
          </div>
          <small className={styles.helper}>{t('personal_info.telephone_helper')}</small>
          {errors.telephone && <p className={styles.error}>{errors.telephone.message}</p>}
        </div>
      </fieldset>

      {/* GROUPE 2 : Détails du projet */}
      <fieldset className={styles.fieldset} style={{ '--i': 1 } as CSSProperties}>
        <legend className={styles.legend}>
          <Icons.Briefcase size={18} />
          {t('project_details.title')}
        </legend>

        <div className={styles.field}>
          <div className={styles.inputWrapper}>
            <Icons.ServicePro size={20} className={styles.inputIcon} />
            <select
              id="devis-prestation"
              {...register('prestation')}
              className={`${styles.input} ${styles.select} ${errors.prestation ? styles.invalid : ''}`}
              aria-invalid={!!errors.prestation}
            >
              <option value="">{t('project_details.select_prestation')}</option>
              {prestations.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <label htmlFor="devis-prestation" className={styles.floatingLabel}>
              {t('project_details.prestation')} *
            </label>
            <Icons.ChevronDown size={18} className={styles.selectChevron} />
          </div>
          {errors.prestation && <p className={styles.error}>{errors.prestation.message}</p>}
        </div>

        <ChoiceGroup
          id="devis-budget"
          label={t('project_details.budget')}
          icon={<Icons.WalletMoney size={18} />}
          options={budgets}
          registration={register('budget')}
          error={errors.budget?.message}
        />

        {/* <div className={styles.field}>
          <div className={styles.inputWrapper}>
            <Icons.Clock size={20} className={styles.inputIcon} />
            <select
              id="devis-delai"
              {...register('delai')}
              className={`${styles.input} ${styles.select} ${errors.delai ? styles.invalid : ''}`}
              aria-invalid={!!errors.delai}
            >
              <option value="">{t('project_details.select_delai')}</option>
              {delais.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
            <label htmlFor="devis-delai" className={styles.floatingLabel}>
              {t('project_details.delai')} *
            </label>
          </div>
          {errors.delai && <p className={styles.error}>{errors.delai.message}</p>}
        </div> */}

        <div className={styles.field}>
          <div className={`${styles.inputWrapper} ${styles.textareaWrapper}`}>
            <Icons.Edit size={20} className={styles.inputIcon} />
            <textarea
              id="devis-description"
              rows={5}
              {...register('description')}
              className={`${styles.input} ${styles.textarea} ${errors.description ? styles.invalid : ''}`}
              placeholder=" "
              aria-invalid={!!errors.description}
            />
            <label htmlFor="devis-description" className={styles.floatingLabel}>
              {t('project_details.description')} {/* ✅ Supprimé le * */}
            </label>
          </div>
          <small className={styles.helper}>{t('project_details.description_helper')}</small>
          {errors.description && <p className={styles.error}>{errors.description.message}</p>}
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

      {/* Bouton d'envoi */}
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