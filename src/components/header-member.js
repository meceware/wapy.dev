'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
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

export const HeaderMemberMainNavigation = (
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

export const HeaderMemberIconNavigation = (
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
    <Button variant='ghost' size='icon' title='Sign out' onClick={() => signOut({ callbackUrl: '/' })} className='hidden md:flex'>
      <Icons.signOut className='size-5' />
    </Button>

    {/* Mobile Menu */}
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
          <Link href='/' className='flex items-center gap-2 cursor-pointer focus:outline-hidden'>
            <Icons.send className='size-5' />
            Contact
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className='flex items-center gap-2 cursor-pointer'>
          <Icons.signOut className='size-5' />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </>
);