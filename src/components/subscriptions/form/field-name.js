'use client';

import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export const FormFieldName = ({ field }) => {
  return (
    <FormItem>
      <FormLabel>Name</FormLabel>
      <FormControl>
        <Input placeholder='Subscription Name' {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};