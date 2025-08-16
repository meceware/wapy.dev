'use client';

import { useState, useRef, useEffect } from 'react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Icons } from '@/components/icons';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import { LogoIcon } from '@/components/ui/icon-picker';

export const PaymentMethodFieldManager = ({ field, paymentMethods }) => {
  const [open, setOpen] = useState(false);
  const [currentPaymentMethods, setCurrentPaymentMethods] = useState(paymentMethods);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(field.value || []);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    field.onChange(selectedPaymentMethod);
  }, [selectedPaymentMethod]);

  const CommandItemCreate = ({value, onSelect}) => {
    if (value === '' || value.length < 3) return false;

    const hasNoPaymentMethod = !currentPaymentMethods
      .map(({ name }) => name.toLowerCase())
      .includes(value.toLowerCase());

    if (!hasNoPaymentMethod) return false;

    return (
      <CommandItem
        key={value}
        value={value}
        className='text-sm text-muted-foreground bg-muted'
        onSelect={onSelect}
      >
        Create new payment method &quot;{value}&quot;
      </CommandItem>
    );
  };

  const onNewPaymentMethod = (name) => {
    const newPaymentMethod = {
      id: '',
      name: name,
      icon: '',
    };
    setSelectedPaymentMethod([newPaymentMethod]);
    setCurrentPaymentMethods([...currentPaymentMethods, newPaymentMethod]);
  };

  const onPaymentMethodSelect = (paymentMethod) => {
    setSelectedPaymentMethod((currentPaymentMethod) =>
      currentPaymentMethod.some((c) => c.id === paymentMethod.id && c.name === paymentMethod.name)
        ? []
        : [paymentMethod]
    );
    inputRef?.current?.focus();
  };

  const onOpenChange = (value) => {
    // If not refed, would scroll automatically to the bottom of page
    inputRef.current?.blur();
    setOpen(value);
    if (value) {
      setInputValue('');
    }
  };

  return (
    <div className='flex flex-col gap-2'>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            className='justify-between h-10 px-3 py-2 font-normal text-sm w-full hover:bg-transparent'
          >
            {selectedPaymentMethod.length === 0 && (
              <span className='truncate'>
                Select payment method
              </span>
            )}
            {selectedPaymentMethod.length !== 0 && (
              <div className='flex items-center gap-2 overflow-hidden'>
                <LogoIcon icon={selectedPaymentMethod[0].icon ? JSON.parse(selectedPaymentMethod[0].icon) : false} placeholder className='size-4' />
                <div className='flex-1 truncate'>{selectedPaymentMethod[0].name}</div>
              </div>
            )}
            <Icons.down className='ml-2 size-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='p-0 w-[300px] sm:w-[512px]' align='start'>
          <Command loop>
            <CommandInput
              ref={inputRef}
              value={inputValue}
              onValueChange={setInputValue}
              placeholder='Search payment method...'
            />
            <CommandList>
              <CommandGroup>
                {currentPaymentMethods.map((paymentMethod) => {
                  const isActive = selectedPaymentMethod.some(c => c.id === paymentMethod.id && c.name === paymentMethod.name);
                  return (
                    <CommandItem
                      key={paymentMethod.name}
                      value={paymentMethod.name}
                      onSelect={() => onPaymentMethodSelect(paymentMethod)}
                      className='gap-2 align-middle justify-center items-center'
                    >
                      <LogoIcon icon={paymentMethod.icon ? JSON.parse(paymentMethod.icon) : false} placeholder className='size-4' />
                      <div className='flex-1 truncate'>{paymentMethod.name}</div>
                      <Icons.check
                        className={cn(
                          isActive ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                    </CommandItem>
                  );
                })}
                <CommandItemCreate
                  onSelect={() => onNewPaymentMethod(inputValue)}
                  value={inputValue}
                />
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export const FormFieldPaymentMethod = ({ field, paymentMethods }) => {
  return (
    <FormItem className='flex-1 truncate space-y-2'>
      <FormLabel>Payment Method</FormLabel>
      <FormControl>
        <PaymentMethodFieldManager field={field} paymentMethods={paymentMethods} />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
