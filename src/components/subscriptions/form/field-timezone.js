'use client';

import { useState } from 'react';
import timezones from 'google-timezones-json';
import { cn } from '@/lib/utils';
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';

export const TimezoneFieldManager = ({ field, loading = false }) => {
  const [open, setOpen] = useState(false);
  const selectedTimezone = timezones[field.value];

  const handleTimezoneChange = async (name) => {
    setOpen(false);
    field.onChange(name);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='justify-between h-9 px-3 py-2 font-normal text-sm w-full hover:bg-transparent'
          disabled={loading}
        >
          <div className='inline-flex items-center text-muted-foreground gap-2 min-w-0'>
            {selectedTimezone ? (
              <>
                <span className='text-primary truncate max-w-full'>{field.value}</span>
                <span className='hidden sm:inline text-xs truncate flex-1 max-w-full'>{selectedTimezone}</span>
              </>
            ) : (
              <span>Select timezone</span>
            )}
          </div>
          {loading
            ? <Icons.spinner className='animate-spin ml-2 text-muted-foreground' />
            : <Icons.down className='ml-2 text-muted-foreground' />
          }
        </Button>
      </PopoverTrigger>
      <PopoverContent className='p-0 w-[300px] sm:w-[512px]' align='start'>
        <Command filter={(name, search) => {
          const timezone = timezones[name];
          if (!timezone) return false;

          const searchLower = search.toLowerCase();
          return name.toLowerCase().includes(searchLower) ||
                  timezone.toLowerCase().includes(searchLower);
        }}>
          <CommandInput placeholder='Search timezone...' />
          <CommandList>
            <CommandEmpty>No results found!</CommandEmpty>
            <CommandGroup>
              {Object.entries(timezones).map(([name, value]) => (
                <CommandItem
                  key={name}
                  value={name}
                  onSelect={(name) => handleTimezoneChange(name)}
                  className='items-start sm:items-center flex-col sm:flex-row gap-0 sm:gap-4 min-w-0'
                  disabled={loading}
                >
                  <span className='truncate max-w-full'>{name}</span>
                  <span className='text-muted-foreground text-xs truncate flex-1 max-w-full'>{value}</span>
                  <Icons.check
                    className={cn(
                      'ml-auto',
                      name === field.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export const FormFieldTimezone = ({ field }) => {
  return (
    <FormItem className='flex-1 truncate space-y-2'>
      <FormLabel>Timezone</FormLabel>
      <div className='flex'>
        <FormControl>
          <TimezoneFieldManager field={field} />
        </FormControl>
        <FormMessage />
      </div>
    </FormItem>
  );
}
