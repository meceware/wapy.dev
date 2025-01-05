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
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { NotificationBell } from '@/components/notifications/notification-bell';

export const HeaderMemberMainNavigation = (
  <nav className='hidden md:flex items-center space-x-6'>
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
    <NotificationBell />
    <Button variant='ghost' size='icon' title='Settings' asChild>
      <Link href='/account' className='hidden md:flex'>
        <Icons.settings className='h-5 w-5' />
      </Link>
    </Button>
    <Button variant='ghost' size='icon' title='Sign out' onClick={() => signOut({ callbackUrl: '/' })} className='hidden md:flex'>
      <Icons.signOut className='h-5 w-5' />
    </Button>

    {/* Mobile Menu */}
    <DropdownMenu>
      <DropdownMenuTrigger asChild className='md:hidden'>
        <Button variant='ghost' size='icon'>
          <Icons.menu className='h-5 w-5' />
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
        <Separator />
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className='flex items-center gap-2 cursor-pointer'>
          <Icons.signOut className='size-5' />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </>
);