// components/forms/RecruitmentForm.tsx
'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Icons } from '@/components/icons/Icons';
import styles from './RecruitmentForm.module.css';

type RecruitmentFormData = {
  nom: string;
  prenom: string;
  cin: string;
  email: string;
  telephone: string;
  dateNaissance: string;
  adresse: string;
  niveauEtudes: string;
  departement: string;
  competences: string;
  motivation: string;
  consentement: boolean;
};

type RecruitmentFormProps = {
  locale: string;
};

export default function RecruitmentForm({ locale }: RecruitmentFormProps) {
  const t = useTranslations('RecruitmentForm');
  const isRtl = locale === 'ar';

  // Schéma de validation dynamique avec messages traduits
  const getRecruitmentSchema = () => {
    return z.object({
      nom: z.string().min(2, t('errors.nom_min')),
      prenom: z.string().min(2, t('errors.prenom_min')),
      cin: z.string().regex(/^[0-9]{8}$/, t('errors.cin_format')),
      email: z.string().email(t('errors.email_invalid')),
      telephone: z.string().regex(/^[0-9]{10}$/, t('errors.telephone_format')),
      dateNaissance: z.string().min(1, t('errors.date_required')),
      adresse: z.string().min(5, t('errors.adresse_min')),
      niveauEtudes: z.string().min(1, t('errors.niveau_required')),
      departement: z.string().min(1, t('errors.departement_required')),
      competences: z.string().min(10, t('errors.competences_min')),
      motivation: z.string().min(20, t('errors.motivation_min')),
      consentement: z.boolean().refine((val) => val === true, {
        message: t('errors.consentement_required'),
      }),
    });
  };

  const recruitmentSchema = getRecruitmentSchema();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RecruitmentFormData>({
    resolver: zodResolver(recruitmentSchema),
    defaultValues: {
      nom: '',
      prenom: '',
      cin: '',
      email: '',
      telephone: '',
      dateNaissance: '',
      adresse: '',
      niveauEtudes: '',
      departement: '',
      competences: '',
      motivation: '',
      consentement: false,
    },
  });

  const onSubmit: SubmitHandler<RecruitmentFormData> = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Candidature :', data);
      setSubmitSuccess(true);
      reset();
    } catch {
      setSubmitError(t('errors.general'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const departements = [
    { value: 'it', label: t('departements.it') },
    { value: 'marketing', label: t('departements.marketing') },
    { value: 'etudes', label: t('departements.etudes') },
    { value: 'dev-co', label: t('departements.dev_co') },
  ];

  const niveauxEtudes = [
    'GI1', 'GI2', 'GI3',
    'GG1', 'GG2', 'GG3',
    'GB1', 'GB2', 'GB3',
    'GE1', 'GE2', 'GE3',
    'GEM1', 'GEM2', 'GEM3',
    'GMMI1', 'GMMI2', 'GMMI3',
    'GC1', 'GC2', 'GC3',
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

        <div className={styles.row}>
          <div className={styles.field}>
            <div className={styles.inputWrapper}>
              <Icons.User size={20} className={styles.inputIcon} />
              <input
                id="recruit-nom"
                type="text"
                {...register('nom')}
                className={`${styles.input} ${errors.nom ? styles.invalid : ''}`}
                placeholder=" "
                aria-invalid={!!errors.nom}
              />
              <label htmlFor="recruit-nom" className={styles.floatingLabel}>
                {t('personal_info.nom')} *
              </label>
            </div>
            {errors.nom && <p className={styles.error}>{errors.nom.message}</p>}
          </div>

          <div className={styles.field}>
            <div className={styles.inputWrapper}>
              <Icons.User size={20} className={styles.inputIcon} />
              <input
                id="recruit-prenom"
                type="text"
                {...register('prenom')}
                className={`${styles.input} ${errors.prenom ? styles.invalid : ''}`}
                placeholder=" "
                aria-invalid={!!errors.prenom}
              />
              <label htmlFor="recruit-prenom" className={styles.floatingLabel}>
                {t('personal_info.prenom')} *
              </label>
            </div>
            {errors.prenom && <p className={styles.error}>{errors.prenom.message}</p>}
          </div>
        </div>

        <div className={styles.field}>
          <div className={styles.inputWrapper}>
            <Icons.CreditCard size={20} className={styles.inputIcon} />
            <input
              id="recruit-cin"
              type="text"
              inputMode="numeric"
              {...register('cin')}
              className={`${styles.input} ${errors.cin ? styles.invalid : ''}`}
              placeholder=" "
              aria-invalid={!!errors.cin}
            />
            <label htmlFor="recruit-cin" className={styles.floatingLabel}>
              {t('personal_info.cin')} *
            </label>
          </div>
          <small className={styles.helper}>{t('personal_info.cin_helper')}</small>
          {errors.cin && <p className={styles.error}>{errors.cin.message}</p>}
        </div>

        <div className={styles.field}>
          <div className={styles.inputWrapper}>
            <Icons.Mail size={20} className={styles.inputIcon} />
            <input
              id="recruit-email"
              type="email"
              {...register('email')}
              className={`${styles.input} ${errors.email ? styles.invalid : ''}`}
              placeholder=" "
              aria-invalid={!!errors.email}
            />
            <label htmlFor="recruit-email" className={styles.floatingLabel}>
              {t('personal_info.email')} *
            </label>
          </div>
          {errors.email && <p className={styles.error}>{errors.email.message}</p>}
        </div>

        <div className={styles.field}>
          <div className={styles.inputWrapper}>
            <Icons.Phone size={20} className={styles.inputIcon} />
            <input
              id="recruit-telephone"
              type="tel"
              {...register('telephone')}
              className={`${styles.input} ${errors.telephone ? styles.invalid : ''}`}
              placeholder=" "
              aria-invalid={!!errors.telephone}
            />
            <label htmlFor="recruit-telephone" className={styles.floatingLabel}>
              {t('personal_info.telephone')} *
            </label>
          </div>
          <small className={styles.helper}>{t('personal_info.telephone_helper')}</small>
          {errors.telephone && <p className={styles.error}>{errors.telephone.message}</p>}
        </div>

        <div className={styles.field}>
          <div className={styles.inputWrapper}>
            <Icons.Calendar size={20} className={styles.inputIcon} />
            <input
              id="recruit-dateNaissance"
              type="date"
              {...register('dateNaissance')}
              className={`${styles.input} ${errors.dateNaissance ? styles.invalid : ''}`}
              placeholder=" "
              aria-invalid={!!errors.dateNaissance}
            />
            <label htmlFor="recruit-dateNaissance" className={styles.floatingLabel}>
              {t('personal_info.date_naissance')} *
            </label>
          </div>
          <small className={styles.helper}>{t('personal_info.date_helper')}</small>
          {errors.dateNaissance && <p className={styles.error}>{errors.dateNaissance.message}</p>}
        </div>

        <div className={styles.field}>
          <div className={styles.inputWrapper}>
            <Icons.Home size={20} className={styles.inputIcon} />
            <input
              id="recruit-adresse"
              type="text"
              {...register('adresse')}
              className={`${styles.input} ${errors.adresse ? styles.invalid : ''}`}
              placeholder=" "
              aria-invalid={!!errors.adresse}
            />
            <label htmlFor="recruit-adresse" className={styles.floatingLabel}>
              {t('personal_info.adresse')} *
            </label>
          </div>
          {errors.adresse && <p className={styles.error}>{errors.adresse.message}</p>}
        </div>

        <div className={styles.field}>
          <div className={styles.inputWrapper}>
            <Icons.GraduationCap size={20} className={styles.inputIcon} />
            <select
              id="recruit-niveauEtudes"
              {...register('niveauEtudes')}
              className={`${styles.input} ${styles.select} ${errors.niveauEtudes ? styles.invalid : ''}`}
              aria-invalid={!!errors.niveauEtudes}
            >
              <option value="">{t('personal_info.select_niveau')}</option>
              {niveauxEtudes.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <label htmlFor="recruit-niveauEtudes" className={styles.floatingLabel}>
              {t('personal_info.niveau_etudes')} *
            </label>
          </div>
          {errors.niveauEtudes && <p className={styles.error}>{errors.niveauEtudes.message}</p>}
        </div>
      </fieldset>

      {/* GROUPE 2 : Candidature */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>
          <Icons.Briefcase size={18} />
          {t('candidature.title')}
        </legend>

        <div className={styles.field}>
          <div className={styles.inputWrapper}>
            <Icons.Code size={20} className={styles.inputIcon} />
            <select
              id="recruit-departement"
              {...register('departement')}
              className={`${styles.input} ${styles.select} ${errors.departement ? styles.invalid : ''}`}
              aria-invalid={!!errors.departement}
            >
              <option value="">{t('candidature.select_departement')}</option>
              {departements.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
            <label htmlFor="recruit-departement" className={styles.floatingLabel}>
              {t('candidature.departement')} *
            </label>
          </div>
          {errors.departement && <p className={styles.error}>{errors.departement.message}</p>}
        </div>

        <div className={styles.field}>
          <div className={`${styles.inputWrapper} ${styles.textareaWrapper}`}>
            <Icons.Edit size={20} className={styles.inputIcon} />
            <textarea
              id="recruit-competences"
              rows={3}
              {...register('competences')}
              className={`${styles.input} ${styles.textarea} ${errors.competences ? styles.invalid : ''}`}
              placeholder=" "
              aria-invalid={!!errors.competences}
            />
            <label htmlFor="recruit-competences" className={styles.floatingLabel}>
              {t('candidature.competences')} *
            </label>
          </div>
          <small className={styles.helper}>{t('candidature.competences_helper')}</small>
          {errors.competences && <p className={styles.error}>{errors.competences.message}</p>}
        </div>

        <div className={styles.field}>
          <div className={`${styles.inputWrapper} ${styles.textareaWrapper}`}>
            <Icons.Heart size={20} className={styles.inputIcon} />
            <textarea
              id="recruit-motivation"
              rows={4}
              {...register('motivation')}
              className={`${styles.input} ${styles.textarea} ${errors.motivation ? styles.invalid : ''}`}
              placeholder=" "
              aria-invalid={!!errors.motivation}
            />
            <label htmlFor="recruit-motivation" className={styles.floatingLabel}>
              {t('candidature.motivation')} *
            </label>
          </div>
          <small className={styles.helper}>{t('candidature.motivation_helper')}</small>
          {errors.motivation && <p className={styles.error}>{errors.motivation.message}</p>}
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