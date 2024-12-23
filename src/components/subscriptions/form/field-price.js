'use client';

import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export const FormFieldPrice = ({ field }) => {
  return (
    <FormItem className='w-full sm:w-[200px]'>
      <FormLabel>Price</FormLabel>
      <FormControl>
        <Input
          type='number'
          step='0.01'
          min='0'
          placeholder='9.99'
          className='text-sm'
          {...field}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};