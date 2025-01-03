'use client';

import {
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { IconPicker } from '@/components/ui/icon-picker';

export const FormFieldLogo = ({ field }) => {
  return (
    <FormItem>
      <FormLabel>Logo</FormLabel>
      <FormControl>
        <div className='flex flex-col gap-1'>
          <IconPicker
            icon={field.value}
            onChange={field.onChange}
          />
        </div>
      </FormControl>
      <FormDescription>
        Select a predefined icon or enter an URL
      </FormDescription>
      <FormMessage />
    </FormItem>
  );
};
