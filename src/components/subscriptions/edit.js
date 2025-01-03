'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogFooter,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
} from '@/components/ui/responsive-dialog';
import { SchemaSubscriptionEdit } from '@/components/subscriptions/schema';
import { SubscriptionActionEdit, SubscriptionActionDelete } from '@/components/subscriptions/actions';
import { FormFieldName } from '@/components/subscriptions/form/field-name';
import { FormFieldLogo } from '@/components/subscriptions/form/form-logo';
import { FormFieldCurrency } from '@/components/subscriptions/form/field-currency';
import { FormFieldPrice } from '@/components/subscriptions/form/field-price';
import { FormFieldPaymentDate } from '@/components/subscriptions/form/field-payment-date';
import { FormFieldCycle } from '@/components/subscriptions/form/field-cycle';
import { FormFieldUrl } from '@/components/subscriptions/form/field-url';
import { FormFieldNotes } from '@/components/subscriptions/form/field-notes';
import { FormFieldUntilDate } from '@/components/subscriptions/form/field-until-date';
import { FormFieldTimezone } from '@/components/subscriptions/form/field-timezone';
import { FormFieldCategory } from '@/components/subscriptions/form/field-category';
import { FormFieldNotifications } from '@/components/subscriptions/form/field-notifications';
import { addDays } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { Icons } from '@/components/icons';

export const SubscriptionEdit = ({ user, subscription = undefined, categories = [] }) =>  {
  const [dialogOpen, setDialogOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(SchemaSubscriptionEdit),
    defaultValues: {
      id: subscription?.id,
      name: subscription?.name || '',
      logo: subscription?.logo || '',
      enabled: subscription?.enabled !== undefined ? subscription?.enabled : true,
      price: subscription?.price || 9.99,
      currency: subscription?.currency || user.currency,
      paymentDate: subscription?.paymentDate ? toZonedTime(subscription.paymentDate, subscription.timezone) : addDays(toZonedTime(new Date(), user.timezone).setHours(9, 0, 0, 0), 1),
      untilDate: subscription?.untilDate ? toZonedTime(subscription.untilDate, subscription.timezone) : null,
      timezone: subscription?.timezone || user.timezone,
      cycle: subscription?.cycle || { time: 'MONTHS', every: 1 },
      url: subscription?.url || '',
      notes: subscription?.notes || '',
      categories: subscription?.categories || [],
      notifications: subscription?.notifications || user.notifications,
    }
  });

  async function onSubmit(values) {
    if (values?.untilDate) {
      values.untilDate.setHours(values.paymentDate.getHours(), values.paymentDate.getMinutes(), values.paymentDate.getSeconds());
      values.untilDate = fromZonedTime(values.untilDate, values.timezone);
    }
    values.paymentDate = fromZonedTime(values.paymentDate, values.timezone);
    const subscription = await SubscriptionActionEdit(values);
    if (!subscription) {
      toast.error('Interesting, cannot create subscription!');
    } else {
      toast.success('Subscription created successfully!');
    }
  }

  async function onDelete() {
    const result = await SubscriptionActionDelete(subscription.id);
    if (result) {
      toast.success('Subscription deleted successfully!');
    } else {
      toast.error('Failed to delete subscription!');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full max-w-2xl flex flex-col gap-6 text-left'>
        <FormField
          control={form.control}
          name='enabled'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className='flex items-center gap-4'>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <FormLabel className='inline-flex flex-row gap-2'>
                    <h3 className='text-lg font-semibold'>Subscription Details</h3>
                  </FormLabel>
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        {/* Name */}
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormFieldName field={field} />
          )}
        />

        {/* Logo */}
        <FormField
          control={form.control}
          name='logo'
          render={({ field }) => (
            <FormFieldLogo field={field} />
          )}
        />

        <div className='flex flex-col sm:flex-row gap-4'>
          {/* Price */}
          <FormField
            control={form.control}
            name='price'
            render={({ field }) => (
              <FormFieldPrice field={field} />
            )}
          />

          {/* Currency */}
          <FormField
            control={form.control}
            name='currency'
            render={({ field }) => (
              <FormFieldCurrency field={field} />
            )}
          />
        </div>

        {/* Payment Date */}
        <FormField
          control={form.control}
          name='paymentDate'
          render={({ field }) => (
            <FormFieldPaymentDate field={field} />
          )}
        />

        {/* Cycle */}
        <FormField
          control={form.control}
          name='cycle'
          render={({ field }) => (
            <FormFieldCycle field={field} />
          )}
        />

        {/* URL */}
        <FormField
          control={form.control}
          name='url'
          render={({ field }) => (
            <FormFieldUrl field={field} />
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name='notes'
          render={({ field }) => (
            <FormFieldNotes field={field} />
          )}
        />

        {/* Categories */}
        <FormField
          control={form.control}
          name='categories'
          render={({ field }) => (
            <FormFieldCategory field={field} categories={categories} />
          )}
        />

        <Accordion type='single' collapsible className='w-full'>
          <AccordionItem value='advanced'>
            <AccordionTrigger>Advanced Settings</AccordionTrigger>
            <AccordionContent>
              <div className='flex flex-col gap-6 m-1'>
                <FormField
                  control={form.control}
                  name='untilDate'
                  render={({ field }) => (
                    <FormFieldUntilDate field={field} />
                  )}
                />

                <FormField
                  control={form.control}
                  name='timezone'
                  render={({ field }) => (
                    <FormFieldTimezone field={field} />
                  )}
                />

                <FormField
                  control={form.control}
                  name='notifications'
                  render={({ field }) => (
                    <FormFieldNotifications field={field} />
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
          <Button
            type='submit'
            className='w-full sm:w-auto'
          >
            <Icons.save />
            {subscription ? 'Update Subscription' : 'Create Subscription'}
          </Button>
          {subscription?.id && (
            <Button
              type='button'
              className='w-full sm:w-auto'
              variant='destructive'
              onClick={() => setDialogOpen(true)}
            >
              <Icons.trash />
              Delete Subscription
            </Button>
          )}
        </div>
      </form>
      <ResponsiveDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Delete Subscription</ResponsiveDialogTitle>
            <ResponsiveDialogDescription className='text-left'>
              Are you sure you want to delete this subscription? This action cannot be undone.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <ResponsiveDialogFooter>
            <Button
              variant='outline'
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {setDialogOpen(false); onDelete();}}
              variant='destructive'
            >
              Delete
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </Form>
  )
}
