'use client';

import { Input } from '@/components/ui/input';
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';

export const FormFieldUrl = ({ field }) => {
  return (
    <FormItem className='flex flex-col'>
      <FormLabel>URL</FormLabel>
      <FormControl>
        <Input
          type='url'
          placeholder='https://...'
          {...field}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}