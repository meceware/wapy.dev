'use client';

import Link from 'next/link';
import { Icons } from '@/components/icons';
import { Separator } from '@/components/ui/separator';

export default function Footer( { author, github } ) {
  return (
    <footer className='border-t'>
      <div className='container mx-auto px-4 py-6'>
        <div className='flex flex-col lg:flex-row items-center justify-between gap-4'>
          <div className='flex items-center shrink-0'>
            <p className='text-sm'>
              Made with ♥ by{' '}
              <Link href={ author.url } className={ 'font-medium underline underline-offset-4 focus:outline-none' } target='_blank' rel='noreferrer noopener'>
                { author.name }
              </Link>
              { '.' }
            </p>
          </div>
          <div className='flex flex-col sm:flex-row items-center justify-center gap-2'>
            <div className='flex items-center gap-2'>
              <Link href='/privacy' className='inline-flex items-center gap-1 text-sm text-center font-medium focus:outline-none'>
                <Icons.shieldCheck className='hidden sm:inline size-4' />
                Privacy Policy
              </Link>
              <Separator orientation='vertical' className='h-4' />
              <Link href='/terms-of-service' className='inline-flex items-center gap-1 text-sm text-center font-medium focus:outline-none'>
                <Icons.scroll className='hidden sm:inline size-4' />
                Terms of Service
              </Link>
            </div>
            <Separator orientation='vertical' className='h-4 hidden sm:block' />
            <div className='flex items-center gap-2'>
              <Link href='/refund-policy' className='inline-flex items-center gap-1 text-sm text-center font-medium focus:outline-none'>
                <Icons.receipt className='hidden sm:inline size-4' />
                Refund Policy
              </Link>
            </div>
            <Separator orientation='vertical' className='h-4 hidden sm:block' />
            <div className='flex items-center gap-2'>
              <Link href='/contact' className='inline-flex items-center gap-1 text-sm text-center font-medium focus:outline-none'>
                <Icons.send className='hidden sm:inline size-4' />
                Contact Us
              </Link>
              <Separator orientation='vertical' className='h-4' />
              <Link href={ github } target='_blank' className='inline-flex items-center gap-1 text-sm text-center font-medium focus:outline-none' rel='noreferrer noopener'>
                <Icons.github className='hidden sm:inline size-4' />
                Github
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}