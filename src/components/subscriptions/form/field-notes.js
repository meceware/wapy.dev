'use client';

import { Textarea } from '@/components/ui/textarea';
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';

export const FormFieldNotes = ({ field }) => {
  return (
    <FormItem className='flex flex-col'>
      <FormLabel>Notes</FormLabel>
      <FormControl>
        <Textarea
          placeholder='Add notes...'
          className='min-h-20'
          {...field}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}