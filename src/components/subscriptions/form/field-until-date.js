'use client';

import { DateTimePicker } from '@/components/ui/datetime-picker';
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';

export const FormFieldUntilDate = ({ field }) => {
  return (
    <FormItem className='flex flex-col'>
      <FormLabel>Valid Until</FormLabel>
      <FormControl>
        <DateTimePicker
          min={new Date()}
          hideTime={true}
          clearable
          value={field.value}
          onChange={field.onChange}
        />
      </FormControl>
      <FormDescription>
        Leave empty for an indefinite subscription
      </FormDescription>
      <FormMessage />
    </FormItem>
  )
}