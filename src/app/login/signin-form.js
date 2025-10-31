'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from "@/lib/auth-client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema, signInOTPSchema } from './schema';
import { signInAction, signInOTPAction } from './action';

const SignInOTP = ({ email }) => {
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {refetch} = useAuth();
  const router = useRouter();

  const onSubmit = useCallback(async (code) => {
    setIsSubmitting(true);

    try {
      const parsedCode = signInOTPSchema.safeParse({ code });
      const parsedEmail = signInSchema.safeParse({ email });

      if (!parsedCode.success || !parsedEmail.success) {
        toast.error('The code looks incorrect. Double-check the 6 digits and try again.');
        return;
      }

      const result = await signInOTPAction({
        email: parsedEmail.data.email,
        code: parsedCode.data.code,
      });

      if (result?.error === 'Access Denied') {
        toast.error('Sorry, you do not have access to this workspace.');
        return;
      }

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Welcome! You have successfully signed in.');
      refetch();
      router.push('/');
    } catch (error) {
      toast.error('Something went wrong. Please request a new code and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [email]);

  return (
    <InputOTP
      maxLength={6}
      value={otp}
      onChange={setOtp}
      onComplete={onSubmit}
      disabled={isSubmitting}
      containerClassName='flex-col sm:flex-row justify-center'
    >
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  );
};

const SignInSendAgain = ({ email, onClick }) => {
  const [timeLeft, setTimeLeft] = useState(90);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setIsEnabled(true);
    }
  }, [timeLeft]);

  const handleClick = () => {
    setIsEnabled(false);
    setTimeLeft(90);
    onClick();
  };

  return (
    <Card className='mx-auto max-w-md shadow-lg w-full'>
      <CardHeader>
        <div className='flex flex-col items-center gap-4'>
          <div className='rounded-full bg-green-100 dark:bg-green-900/30 p-3'>
            <Icons.check className='h-8 w-8 text-green-600 dark:text-green-400' />
          </div>
          <CardTitle className='text-2xl'>Check your inbox</CardTitle>
          <CardDescription className='text-base'>
            We&apos;ve sent a link to your email to sign in.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <Divider text='or' />
        <div className='space-y-2 text-center'>
          <p className='text-sm text-muted-foreground'>Enter the 6-digit code sent to your email</p>
          <SignInOTP email={email} />
        </div>
      </CardContent>
      <CardFooter className='flex flex-col sm:flex-row justify-center gap-0 sm:gap-1'>
        <span className='text-sm text-muted-foreground'>Didn&apos;t receive the email?</span>
        <Button
          onClick={handleClick}
          variant='link'
          className='p-0 h-auto'
          disabled={!isEnabled}
        >
          {isEnabled ? 'Click to resend' : `You can resend in ${timeLeft}s`}
        </Button>
      </CardFooter>
    </Card>
  );
};

export function SignInForm({isGoogle = false, isGithub = false, genericAuthProvider = false}) {
  const [loginMethod, setLoginMethod] = useState(null);
  const [success, setSuccess] = useState(false);
  const {signIn} = useAuth();

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
        if (result?.error === 'Access Denied') {
          toast.error('Sorry but you are not allowed to sign in!');
        } else {
          toast.error('Weird! We couldn\'t sign you in. It might be your email, or something went wrong on our end.');
        }
      } else {
        setSuccess(true);
      }
    } finally {
      setLoginMethod(null);
    }
  };

  const signInGithub = async () => {
    if (!isGithub) return;

    setLoginMethod('github');
    await signIn.social({
      provider: 'github',
      redirectTo: '/'
    }).finally(() => {
      setLoginMethod(null);
    });
  };

  const signInGoogle = async () => {
    if (!isGoogle) return;

    setLoginMethod('google');
    await signIn.social({
      provider: 'google',
      redirectTo: '/'
    }).finally(() => {
      setLoginMethod(null);
    });
  };

  const signInGenericOAuth = () => {
    if (!genericAuthProvider) return;

    setLoginMethod(genericAuthProvider);
    signIn.oauth2({
      providerId: genericAuthProvider,
      callbackURL: '/',
    }).finally(() => {
      setLoginMethod(null);
    });
  };

  if (success) {
    return (
      <SignInSendAgain email={form.getValues('email')} onClick={() => setSuccess(false)} />
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
        { (isGoogle || isGithub || genericAuthProvider) && (
          <Divider text='or' />
        ) }
        { (isGithub) && (
          <Button variant='outline' className='w-full' onClick={signInGithub} disabled={!!loginMethod}>
            {loginMethod === 'github'
              ? <Icons.spinner className='mr-2 animate-spin' />
              : <Icons.github className='mr-2' />
            }
            Login with Github
          </Button>
        ) }
        { (isGoogle) && (
          <Button variant='outline' className='w-full' onClick={signInGoogle} disabled={!!loginMethod}>
            {loginMethod === 'google'
              ? <Icons.spinner className='mr-2 animate-spin' />
              : <Icons.google className='mr-2' />
            }
            Login with Google
          </Button>
        ) }
        { (genericAuthProvider) && (
          <Button variant='outline' className='w-full' onClick={signInGenericOAuth} disabled={!!loginMethod}>
            {loginMethod === genericAuthProvider
              ? <Icons.spinner className='mr-2 animate-spin' />
              : (
                genericAuthProvider.toLowerCase() === 'keycloak' ? <Icons.keycloak className='mr-2' /> :
                genericAuthProvider.toLowerCase() === 'authentik' ? <Icons.authentik className='mr-2' /> :
                <Icons.KeyRound className='mr-2 text-green-600' />
              )
            }
            Login with {genericAuthProvider.replace(/\b\w/g, l => l.toUpperCase())}
          </Button>
        ) }
      </CardContent>
    </Card>
  );
}
