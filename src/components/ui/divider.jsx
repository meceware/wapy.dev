'use client'

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const Divider = forwardRef((
  { className, text, ...props },
  ref
) => (
  <div
    ref={ref}
    className={cn(
      'inline-flex flex-row items-center gap-4 text-muted-foreground text-sm',
      className
    )}
    {...props}
  >
    <Separator orientation='horizontal' className='flex-1' />
    {text}
    <Separator orientation='horizontal' className='flex-1' />
  </div>
));
Divider.displayName = 'Divider';

export { Divider };
