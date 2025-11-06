'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useEventListener } from 'usehooks-ts';
import { cn } from '@/lib/utils';
import { ModeToggle } from '@/components/mode-toggle';
import { useThrottle } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { useAuth } from '@/lib/auth-client';

const HeaderBase = ({ mainNavigation = (<></>), iconNavigation = (<></>) }) => {
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
                priority
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

export function HeaderVisitor() {
  const IconNavigation = () => (
    <>
      <Button variant='ghost' size='icon' title='Contact' className='hidden md:flex' asChild>
        <Link href='/contact'>
          <Icons.send className='size-5' />
        </Link>
      </Button>
      <Button variant='ghost' size='icon' title='Sign in' asChild>
        <Link href='/login'>
          <Icons.signIn className='size-5' />
        </Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild className='md:hidden'>
          <Button variant='ghost' size='icon'>
            <Icons.menu className='size-5' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-52 space-y-2 px-1 py-2'>
          <DropdownMenuItem asChild>
            <Link href='/pricing' className='flex items-center gap-2 cursor-pointer focus:outline-hidden'>
              <Icons.wallet className='size-4' />
              Pricing
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href='/refund-policy' className='flex items-center gap-2 cursor-pointer focus:outline-hidden'>
              <Icons.receipt className='size-4' />
              Refund Policy
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href='/privacy' className='flex items-center gap-2 cursor-pointer focus:outline-hidden'>
              <Icons.shieldCheck className='size-4' />
              Privacy Policy
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href='/terms-of-service' className='flex items-center gap-2 cursor-pointer focus:outline-hidden'>
              <Icons.scroll className='size-4' />
              Terms of Service
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href='/contact' className='flex items-center gap-2 cursor-pointer focus:outline-hidden'>
              <Icons.send className='size-5' />
              Contact Us
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  return (
    <HeaderBase iconNavigation={<IconNavigation />} />
  );
}

export const HeaderMember = () => {
  const { signOut } = useAuth();

  const MainNavigation = () => (
    <nav className='hidden md:flex items-center gap-4'>
      <Button variant='link' asChild>
        <Link href='/'>
          Subscriptions
        </Link>
      </Button>
      <Button variant='link' asChild>
        <Link href='/reports'>
          Reports
        </Link>
      </Button>
    </nav>
  );

  const IconNavigation = () => (
    <>
      <Button variant='ghost' size='icon' title='Contact' className='hidden md:flex' asChild>
        <Link href='/contact'>
          <Icons.send className='size-5' />
        </Link>
      </Button>
      <NotificationBell />
      <Button variant='ghost' size='icon' title='Settings' className='hidden md:flex' asChild>
        <Link href='/account'>
          <Icons.settings className='size-5' />
        </Link>
      </Button>
      <Button variant='ghost' size='icon' title='Sign out' onClick={() => signOut()} className='hidden md:flex cursor-pointer'>
        <Icons.signOut className='size-5' />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild className='md:hidden'>
          <Button variant='ghost' size='icon'>
            <Icons.menu className='size-5' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-40 space-y-1'>
          <DropdownMenuItem asChild>
            <Link href='/' className='flex items-center gap-2 cursor-pointer'>
              <Icons.logo className='size-5' />
              Subscriptions
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href='/reports' className='flex items-center gap-2 cursor-pointer'>
              <Icons.chart className='size-5' />
              Reports
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href='/account' className='flex items-center gap-2 cursor-pointer'>
              <Icons.settings className='size-5' />
              Account
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href='/contact' className='flex items-center gap-2 cursor-pointer focus:outline-hidden'>
              <Icons.send className='size-5' />
              Contact Us
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => signOut()} className='flex items-center gap-2 cursor-pointer'>
            <Icons.signOut className='size-5' />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  return (
    <HeaderBase
      mainNavigation={<MainNavigation />}
      iconNavigation={<IconNavigation />}
    />
  );
};

export const Header = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <HeaderMember /> : <HeaderVisitor />;
};