'use client';

import { addYears } from 'date-fns';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';

export const FormFieldPaymentDate = ({ field }) => {
  return (
    <FormItem className='flex flex-col'>
      <FormLabel>Next Payment Date</FormLabel>
      <FormControl>
        <DateTimePicker
          min={new Date()}
          max={addYears(new Date(), 15)}
          timePicker={{ hour: true, minute: true, second: false, increment: 30 }}
          value={field.value}
          onChange={field.onChange}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}