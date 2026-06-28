// lib/data/sliderData.tsx
import { Slide } from '@/components/ui/Slider';
import { Icons } from '@/components/icons/Icons';
import { isRecruitmentOpen } from '@/lib/utils/date';

type TFunction = (key: string) => string;

export const getSliderSlides = (locale: string, t: TFunction): Slide[] => {
  const recruitmentOpen = isRecruitmentOpen();

  const slides: Slide[] = [
    {
      id: 1,
      title: t('services.title'),
      description: t('services.description'),
      icon: <Icons.Code size={32} stroke="currentColor" />,
      cta: { label: t('services.cta'), href: `/${locale}/services` },
    },
    {
      id: 2,
      title: t('it.title'),
      description: t('it.description'),
      icon: <Icons.Globe size={32} stroke="currentColor" />,
      cta: { label: t('it.cta'), href: `/${locale}/services#it` },
    },
    {
      id: 3,
      title: t('etudes.title'),
      description: t('etudes.description'),
      icon: <Icons.Chart size={32} stroke="currentColor" />,
      cta: { label: t('etudes.cta'), href: `/${locale}/services#etudes` },
    },
    {
      id: 4,
      title: t('branding.title'),
      description: t('branding.description'),
      icon: <Icons.Palette size={32} stroke="currentColor" />,
      cta: { label: t('branding.cta'), href: `/${locale}/services#marketing` },
    },
    {
      id: 5,
      title: t('partenariat.title'),
      description: t('partenariat.description'),
      icon: <Icons.Share size={32} stroke="currentColor" />,
      cta: { label: t('partenariat.cta'), href: `/${locale}/contact` },
    },
  ];

  if (recruitmentOpen) {
    slides.push({
      id: 6,
      title: t('recrutement.title'),
      description: t('recrutement.description'),
      icon: <Icons.User size={32} stroke="currentColor" />,
      cta: { label: t('recrutement.cta'), href: `/${locale}/recrutement` },
    });
  }

  return slides;
};