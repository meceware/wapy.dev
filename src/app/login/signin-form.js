'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Divider } from '@/components/ui/divider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema } from './schema';
import { signInAction } from './action';

const SignInSendAgain = ({ onClick }) => {
  return (
    <Card className='mx-auto max-w-md shadow-lg bg-green-50 dark:bg-green-900/10'>
      <CardHeader className='flex flex-row items-center gap-4'>
        <div className='rounded-full bg-green-100 dark:bg-green-900/30 p-2'>
          <Icons.check className='h-6 w-6 text-green-600 dark:text-green-400' />
        </div>
        <div className='flex flex-col gap-2 text-left'>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            {`We've sent you a login link. Didn't receive it?`}
            <br />
            <Button
              onClick={onClick}
              variant='link'
              className='h-auto p-0 text-green-600 dark:text-green-400'
            >
              Send again
            </Button>
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
};

export function SignInForm() {
  const [loginMethod, setLoginMethod] = useState(null);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    setLoginMethod('email');
    try {
      const result = await signInAction(data);
      if (!result || result?.error) {
        toast.error('Weird! Can you make sure your email is correct?');
      } else {
        setSuccess(true);
      }
    } finally {
      setLoginMethod(null);
    }
  };

  const signInGithub = () => {
    setLoginMethod('github');
    signIn('github', { redirect: false, redirectTo: '/' }).finally(() => {
      setLoginMethod(null);
    });
  };

  const signInGoogle = () => {
    setLoginMethod('google');
    signIn('google', { redirect: false, redirectTo: '/' }).finally(() => {
      setLoginMethod(null);
    });
  };

  if (success) {
    return (
      <SignInSendAgain onClick={() => setSuccess(false)} />
    );
  }

  return (
    <Card className='mx-auto max-w-md shadow-lg'>
      <CardHeader>
        <CardTitle className='text-2xl'>Sign in</CardTitle>
        <CardDescription>
          Sign in with your email to access your account or create a new one automatically
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-1'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type='email' placeholder='m@example.com' {...field} />
                  </FormControl>
                  <FormMessage className='text-left' />
                </FormItem>
              )}
            />
            <Button type='submit' className='w-full' disabled={!!loginMethod}>
              {loginMethod === 'email'
                ? <Icons.spinner className='mr-2 size-4 animate-spin' />
                : <Icons.send className='mr-2 size-4' />
              }
              Login
            </Button>
          </form>
        </Form>
        <Divider text='or' />
        <Button variant='outline' className='w-full' onClick={signInGithub} disabled={!!loginMethod}>
          {loginMethod === 'github'
            ? <Icons.spinner className='mr-2 size-4 animate-spin' />
            : <Icons.github className='mr-2 size-4' />
          }
          Login with Github
        </Button>
        <Button variant='outline' className='w-full' onClick={signInGoogle} disabled={!!loginMethod}>
          {loginMethod === 'google2'
            ? <Icons.spinner className='mr-2 size-4 animate-spin' />
            : <Icons.google className='mr-2 size-4' />
          }
          Login with Google
        </Button>
      </CardContent>
    </Card>
  );
}
