'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useEventListener } from 'usehooks-ts';
import { cn } from '@/lib/utils';
import { ModeToggle } from '@/components/mode-toggle';
import { useThrottle } from '@/lib/hooks';

export default function Header({ mainNavigation = (<></>), iconNavigation = (<></>) }) {
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const throttle = useThrottle();
  const onScroll = () => {
    const currentScrollPos = window.scrollY;
    const isScrollingDown = prevScrollPos < currentScrollPos;

    setVisible(!isScrollingDown || currentScrollPos < 80);
    setPrevScrollPos(currentScrollPos);
  };

  useEventListener('scroll', () => {
    throttle(onScroll, 250);
  });

  return (
    <header className={ cn(
      'sticky top-0 w-full shadow-sm border-b bg-background transition-transform duration-300 z-20',
      { 'transform': visible, '-translate-y-full': !visible }
    ) }>
      <div className='container mx-auto px-4'>
        <div className='h-16 flex items-center justify-between'>
          {/* Logo and Brand */}
          <div className='flex'>
            <Link href='/' className='inline-flex items-center space-x-2'>
              <Image
                src='/icons/icon-32.png'
                alt='Description of the image'
                width={32}
                height={32}
              />
              <div className='inline-flex gap-0 justify-center items-end'>
                <span className='font-semibold text-xl'>Wapy</span>
                <span className='text-sm text-muted-foreground'>.dev</span>
              </div>
            </Link>
          </div>

          {/* Main Navigation */}
          { mainNavigation }

          {/* Right Side Icons */}
          <div className='flex items-center gap-1 md:gap-2'>
            <ModeToggle />
            { iconNavigation }
          </div>
        </div>
      </div>
    </header>
  );
}