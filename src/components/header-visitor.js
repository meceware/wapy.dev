'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export const HeaderVisitorIconNavigation = (
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

    {/* Mobile Menu */}
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