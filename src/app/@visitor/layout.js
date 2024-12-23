'use server';

import Link from 'next/link';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

// Root Layout
export default async function LayoutVisitor({ children }) {
  const iconNavigation = (
    <>
      <Button variant='ghost' size='icon' title='Sign in' asChild>
        <Link href='/login'>
          <Icons.signIn className='h-5 w-5' />
        </Link>
      </Button>
    </>
  );

  return (
    <>
      <Header iconNavigation={iconNavigation} />
      <main className='flex flex-col h-full grow items-center p-8 md:p-12'>
        <div className='container flex flex-col items-center gap-6 text-center grow'>
          { children }
        </div>
      </main>
    </>
  );
}
