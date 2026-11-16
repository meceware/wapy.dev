'use client';

import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
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
import { DefaultCurrencies } from '@/config/currencies';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';

export const CurrencyFieldManager = ({ field, loading = false }) => {
  const t = useTranslations('components.subscriptions.form.fields.currency');
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  const currencyDisplayNames = useMemo(() => {
    try {
      return new Intl.DisplayNames([locale], { type: 'currency' });
    } catch (error) {
      return null;
    }
  }, [locale]);

  const getCurrencyName = (currencyCode) => {
    if (currencyDisplayNames) {
      const localizedName = currencyDisplayNames.of(currencyCode);
      if (localizedName) {
        return localizedName;
      }
    }
    return DefaultCurrencies[currencyCode]?.name || currencyCode;
  };

  const handleCurrencyChange = async (currency) => {
    setOpen(false);
    field.onChange(currency);
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
            {field.value ? (
              <>
                <span className='text-primary truncate max-w-full'>{getCurrencyName(field.value)}</span>
                <span className='hidden sm:inline text-xs truncate flex-1 max-w-full'>{field.value} ({DefaultCurrencies[field.value].symbol})</span>
              </>
            ) : (
              <span>{t('placeholder')}</span>
            )}
          </div>
          {loading
            ? <Icons.spinner className='animate-spin ms-2 text-muted-foreground' />
            : <Icons.down className='ms-2 text-muted-foreground' />
          }
        </Button>
      </PopoverTrigger>
      <PopoverContent className='p-0 w-75 sm:w-lg' align='start'>
        <Command filter={(value, search) => {
          const currency = DefaultCurrencies?.[value];
          if (!currency) return false;

          const searchLower = search.toLowerCase();
          const localizedName = getCurrencyName(value).toLowerCase();

          return value.toLowerCase().includes(searchLower) ||
                  localizedName.includes(searchLower) ||
                  currency.symbol.toLowerCase().includes(searchLower);
        }}>
          <CommandInput placeholder={t('search')} />
          <CommandList>
            <CommandEmpty>{t('noResults')}</CommandEmpty>
            <CommandGroup>
              {Object.entries(DefaultCurrencies).map(([name, value]) => (
                <CommandItem
                  key={name}
                  value={name}
                  onSelect={(name) => handleCurrencyChange(name)}
                  className='items-start sm:items-center flex-col sm:flex-row gap-0 sm:gap-4 min-w-0'
                  disabled={loading}
                >
                  <span className='truncate max-w-full'>{getCurrencyName(name)}</span>
                  <span className='text-muted-foreground text-xs truncate flex-1 max-w-full'>{name} ({value.symbol})</span>
                  <Icons.check
                    className={cn(
                      'ms-auto',
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

export const FormFieldCurrency = ({ field }) => {
  const t = useTranslations('components.subscriptions.form.fields.currency');

  return (
    <FormItem className='flex-1 truncate space-y-2'>
      <FormLabel>{t('label')}</FormLabel>
      <div className='flex'>
        <FormControl>
          <CurrencyFieldManager field={field} />
        </FormControl>
        <FormMessage />
      </div>
    </FormItem>
  );
}
