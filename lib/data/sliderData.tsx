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
      icon: <Icons.FlexibleSolutions size={32} stroke="currentColor" />,
      image: '/slider/services-bg.svg',
      cta: { label: t('services.cta'), href: `/${locale}/services` },
    },
    {
      id: 2,
      title: t('it.title'),
      description: t('it.description'),
      icon: <Icons.CodeSlash size={32} stroke="currentColor" />,
      image: '/slider/it-bg.svg',
      cta: { label: t('it.cta'), href: `/${locale}/services#it` },
    },
    {
      id: 3,
      title: t('branding.title'),
      description: t('branding.description'),
      icon: <Icons.Palette size={32} stroke="currentColor" />,
      image: '/slider/branding-bg.svg',
      cta: { label: t('branding.cta'), href: `/${locale}/services#marketing` },   
    },
    {
      id: 4,
      title: t('etudes.title'),
      description: t('etudes.description'),
      icon: <Icons.Business_dep size={32} stroke="currentColor" />,
      image: '/slider/etudes-bg.svg',
      cta: { label: t('etudes.cta'), href: `/${locale}/services#etudes` },
    },
    {
      id: 5,
      title: t('partenariat.title'),
      description: t('partenariat.description'),
      icon: <Icons.Share size={32} stroke="currentColor" />,
      image: '/slider/partenariat-bg.svg',
      cta: { label: t('partenariat.cta'), href: `/${locale}/contact` },
    },
  ];

  if (recruitmentOpen) {
    slides.push({
      id: 6,
      title: t('recrutement.title'),
      description: t('recrutement.description'),
      icon: <Icons.User size={32} stroke="currentColor" />,
      image: '/slider/recrutement-bg.svg',
      cta: { label: t('recrutement.cta'), href: `/${locale}/recrutement` },
    });
  }

  return slides;
};