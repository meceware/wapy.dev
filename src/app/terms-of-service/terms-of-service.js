'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { siteConfig } from '@/components/config';

export const TermsOfService = () => {
  const t = useTranslations('pages.termsOfService');
  const tCommon = useTranslations('common');

  return (
    <div className='flex flex-col items-start justify-start min-h-full mx-auto max-w-4xl'>
      <h1 className='text-3xl font-bold mb-6 text-center'>{tCommon('termsOfService')}</h1>
      <Card className='text-left'>
        <CardContent className='p-6 space-y-6'>
          <section className='space-y-4'>
            <p>
              <strong>{t('lastUpdated')}</strong>
            </p>
          </section>

          <section className='space-y-4'>
            <p>
              {t('welcome', { siteName: siteConfig.name })}
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>{t('overview.title')}</h2>
            <p>
              {t('overview.paragraph1', { siteName: siteConfig.name })}
            </p>
            <p>
              {t('overview.paragraph2')}
            </p>
            <p>
              {t('overview.paragraph3')}
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>{t('websiteTerms.title')}</h2>
            <p>
              {t('websiteTerms.paragraph1')}
            </p>
            <p>
              {t('websiteTerms.paragraph2')}
            </p>
            <ul className='list-disc ps-8'>
              <li>{t('websiteTerms.items.unlawful')}</li>
              <li>{t('websiteTerms.items.comply')}</li>
              <li>{t('websiteTerms.items.malicious')}</li>
            </ul>
            <p>
              {t('websiteTerms.paragraph3')}
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>{t('payment.title')}</h2>
            <p>
              {t('payment.paragraph1')}
            </p>
            <p>
              {t.rich('payment.paragraph2', {
                paddle: (chunks) => (
                  <a
                    href='https://www.paddle.com'
                    className='underline underline-offset-4 focus:outline-hidden'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {chunks}
                  </a>
                ),
                terms: (chunks) => (
                  <a
                    href='https://www.paddle.com/legal/terms'
                    className='underline underline-offset-4 focus:outline-hidden'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {chunks}
                  </a>
                ),
              })}
            </p>
            <p>
              {t.rich('payment.paragraph3', {
                refund: (chunks) => (
                  <Link
                    href='/refund-policy'
                    className='font-medium underline underline-offset-4 focus:outline-hidden'
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>{t('cookies.title')}</h2>
            <p>
              {t.rich('cookies.description', {
                privacy: (chunks) => (
                  <Link
                    href='/privacy'
                    className='font-medium underline underline-offset-4 focus:outline-hidden'
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>{t('intellectualProperty.title')}</h2>
            <p>
              {t('intellectualProperty.description')}
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>{t('disclaimer.title')}</h2>
            <p>
              {t('disclaimer.description')}
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>{t('limitationOfLiability.title')}</h2>
            <p>
              {t('limitationOfLiability.description', { siteName: siteConfig.name })}
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>{t('changes.title')}</h2>
            <p>
              {t('changes.description')}
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>{t('indemnification.title')}</h2>
            <p>
              {t('indemnification.description', { siteName: siteConfig.name })}
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>{t('modifications.title')}</h2>
            <p>
              {t('modifications.paragraph1')}
            </p>
            <p>
              {t('modifications.paragraph2')}
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>{t('governingLaw.title')}</h2>
            <p>
              {t('governingLaw.description', { siteName: siteConfig.name })}
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>{t('entireAgreement.title')}</h2>
            <p>
              {t('entireAgreement.description', { siteName: siteConfig.name })}
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>{t('severability.title')}</h2>
            <p>
              {t('severability.description')}
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>{t('waiver.title')}</h2>
            <p>
              {t('waiver.description', { siteName: siteConfig.name })}
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>{tCommon('contact')}</h2>
            <p>
              {t.rich('contactUs.description', {
                link: (chunks) => (
                  <Link
                    href='/contact'
                    className='font-medium underline underline-offset-4 focus:outline-hidden'
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};
