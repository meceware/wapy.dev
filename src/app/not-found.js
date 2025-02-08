'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HomeIcon } from 'lucide-react';

export default function NotFound() {
  return (
    <div className='flex flex-col items-center justify-center flex-1 gap-4 px-4'>
      <h1 className='text-4xl font-bold'>404</h1>
      <p className='text-xl text-muted-foreground text-center'>
        Oops! The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Button variant='default' title='Back to Home' asChild>
        <Link href='/'>
          <HomeIcon className='w-4 h-4 mr-2' />
          Back to Home
        </Link>
      </Button>
    </div>
  );
}