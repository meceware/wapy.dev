'use client';

import Link from 'next/link';
import { Icons } from '@/components/icons';
import { Separator } from '@/components/ui/separator';

export default function Footer( { author, github } ) {
  return (
    <footer className='border-t'>
      <div className='container mx-auto p-4'>
        <div className='flex flex-col sm:flex-row items-center justify-between gap-2'>
          <div className='flex items-center'>
            <p className='text-sm'>
              Made with ♥ by{' '}
              <Link href={ author.url } className={ 'font-medium underline underline-offset-4 focus:outline-none' } target='_blank' rel='noreferrer noopener'>
                { author.name }
              </Link>
              { '.' }
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Link href='/privacy' className='text-sm font-medium underline-offset-4 focus:outline-none'>
              Privacy Policy
            </Link>
            <Separator orientation='vertical' className='h-4' />
            <Link href='/contact' className='text-sm font-medium underline-offset-4 focus:outline-none'>
              Contact Us
            </Link>
          </div>
          <div className='flex items-center gap-2'>
            <Link href={ github } className={ 'focus:outline-none' } target='_blank' rel='noreferrer noopener'>
              <Icons.github className={ 'size-5' } />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}