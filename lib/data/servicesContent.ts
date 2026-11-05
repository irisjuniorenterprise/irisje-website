// lib/data/servicesContent.ts
// Contenu éditorial des pages de détail des services, par langue.
// Module pur (utilisé côté serveur : pages, JSON-LD, llms.txt).
import type { Locale } from '../../i18n/config';
import { SERVICES_AR, UI_AR } from './servicesContent.ar';
import { SERVICES_EN, UI_EN } from './servicesContent.en';
import { SERVICES_FR, UI_FR } from './servicesContent.fr';
import type { ServiceContent, ServiceSlug, ServiceUi } from './servicesIndex';

const CONTENT: Record<Locale, Record<ServiceSlug, ServiceContent>> = {
  fr: SERVICES_FR,
  en: SERVICES_EN,
  ar: SERVICES_AR,
};

const UI: Record<Locale, ServiceUi> = { fr: UI_FR, en: UI_EN, ar: UI_AR };

export const getServiceContent = (locale: Locale, slug: ServiceSlug): ServiceContent =>
  CONTENT[locale][slug];

export const getServiceUi = (locale: Locale): ServiceUi => UI[locale];
