'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';

export const PrivacyPolicy = () => {
  const t = useTranslations('pages.privacy');
  const tCommon = useTranslations('common');

  return (
    <div className='flex flex-col items-start justify-start min-h-full mx-auto max-w-4xl'>
      <h1 className='text-3xl font-bold mb-6 text-center'>{tCommon('privacyPolicy')}</h1>
      <Card className='text-left'>
        <CardContent className='p-6 space-y-6'>
          <section className='space-y-4'>
            <p>
              <strong>{t('lastUpdated')}</strong>
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>{t('introduction.title')}</h2>
            <p>
              {t('introduction.paragraph1')}
            </p>
            <p>
              {t('introduction.paragraph2')}
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>{t('informationWeCollect.title')}</h2>
            <p>
              {t('informationWeCollect.description')}
            </p>
            <ul className='list-disc ps-8'>
              <li>{t('informationWeCollect.items.account')}</li>
              <li>{t('informationWeCollect.items.subscription')}</li>
              <li>{t('informationWeCollect.items.expense')}</li>
            </ul>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>{t('howWeUse.title')}</h2>
            <p>
              {t('howWeUse.description')}
            </p>
            <ul className='list-disc ps-8'>
              <li>{t('howWeUse.items.providing')}</li>
              <li>{t('howWeUse.items.managing')}</li>
              <li>{t('howWeUse.items.sending')}</li>
              <li>{t('howWeUse.items.improving')}</li>
            </ul>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>{t('paymentProcessing.title')}</h2>
            <p>
              {t.rich('paymentProcessing.description', {
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
                privacy: (chunks) => (
                  <a
                    href='https://www.paddle.com/legal/privacy'
                    className='underline underline-offset-4 focus:outline-hidden'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {chunks}
                  </a>
                ),
              })}
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>{t('dataProtection.title')}</h2>
            <p>
              {t('dataProtection.description')}
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>{t('analytics.title')}</h2>
            <p>
              {t('analytics.description')}
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>{t('yourRights.title')}</h2>
            <p>
              {t('yourRights.description')}
            </p>
            <ul className='list-disc ps-8'>
              <li>{t('yourRights.items.access')}</li>
              <li>{t('yourRights.items.correct')}</li>
              <li>{t('yourRights.items.delete')}</li>
              <li>{t('yourRights.items.optOut')}</li>
            </ul>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>{tCommon('contact')}</h2>
            <p>
              {t.rich('contactUs.description', {
                link: (chunks) => (
                  <Link
                    href='/contact'
                    className='font-medium underline underline-offset-4 focus:outline-hidden'
                    title={tCommon('contact')}
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>{t('updates.title')}</h2>
            <p>
              {t('updates.description')}
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};
