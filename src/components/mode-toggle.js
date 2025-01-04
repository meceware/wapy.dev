'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [realTheme, setRealTheme] = useState('');

  useEffect(() => {
    setRealTheme(theme);
  }, [theme]);

  return (
    <>
      <div className='hidden md:block'>
        <div className='flex gap-1 rounded-xl bg-gray-600/5 p-1 ring-1 ring-gray-600/5 light:ring-inset dark:bg-black/30 dark:ring-white/5'>
          <Button variant='ghost' title='Dark' className={ cn('p-0 size-5 [&_svg]:size-3 text-gray-400', {'[&_svg]:size-3.5 text-gray': realTheme === 'dark'})} onClick={ () => setTheme('dark') }>
            <Moon />
          </Button>
          <Button variant='ghost' title='Light' className={ cn('p-0 size-5 [&_svg]:size-3 text-gray-400', {'[&_svg]:size-3.5 text-gray': realTheme === 'light'})} onClick={ () => setTheme('light') }>
            <Sun />
          </Button>
          <Button variant='ghost' title='System' className={ cn('p-0 size-5 [&_svg]:size-3 text-gray-400', {'[&_svg]:size-3.5 text-gray': realTheme === 'system'})} onClick={ () => setTheme('system') }>
            <Monitor />
          </Button>
        </div>
      </div>
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='md:hidden'>
          <Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
          <Moon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </>
  );
}