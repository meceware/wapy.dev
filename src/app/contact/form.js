'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { sendContactForm } from '@/app/contact/actions';
import { Icons } from '@/components/icons';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email_address: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  honey_pot_email: z.string().optional(),
});

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email_address: '',
      message: '',
      honey_pot_email: '',
    },
  });

  const onSubmit = async (values) => {
    if (values.honey_pot_email) {
      toast.error('An error occurred. Please try again later.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await sendContactForm(values);

      if (result.error) {
        throw new Error(result.error);
      }

      form.reset();
      setIsSubmitted(true);
      toast.success('Your message has been sent successfully!');
    } catch (error) {
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex flex-col gap-6 max-w-2xl'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>Contact Us</h1>
        <p className='text-muted-foreground text-lg'>
          Have a question or want to get in touch? Fill out the form below and we&apos;ll get back to you as soon as possible.
        </p>
      </div>
      {isSubmitted ? (
        <div className='rounded-lg border bg-card p-6 shadow-xs text-center space-y-4'>
          <Icons.check className='mx-auto h-12 w-12 text-green-500' />
          <h2 className='text-2xl font-semibold'>Thank You!</h2>
          <p className='text-muted-foreground'>
            Your message has been sent successfully.
            <br />
            We&apos;ll get back to you as soon as possible.
          </p>
        </div>
      ) : (
        <div className='rounded-lg border bg-card p-6 shadow-xs'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <div className='grid gap-6 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder='Your name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='email_address'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type='email' placeholder='your@email.com' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name='message'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Tell us how we can help...'
                        className='min-h-[150px] resize-none'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <input
                type='email'
                name='honey_pot_email'
                tabIndex={-1}
                aria-hidden='true'
                {...form.register('honey_pot_email')}
                style={{
                  position: 'absolute',
                  left: '-9999px',
                  opacity: 0,
                  pointerEvents: 'none',
                }}
              />
              <Button type='submit' title='Send Message' size='lg' className='w-full' disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </Button>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}