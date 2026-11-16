'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HomeIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const NotFound = () => {
  const t = useTranslations('pages.notFound');
  return (
    <div className='flex flex-col items-center justify-center flex-1 gap-4 px-4'>
      <h1 className='text-4xl font-bold'>{t('title')}</h1>
      <p className='text-xl text-muted-foreground text-center'>
        Oops! {t('meta.description')}
      </p>
      <Button variant='default' aria-label={t('backToHome')} asChild>
        <Link href='/'>
          <HomeIcon className='w-4 h-4 me-2' />
          {t('backToHome')}
        </Link>
      </Button>
    </div>
  );
};
