'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('pages.login');
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
        toast.error(t('toast.error.invalidCode'));
        return;
      }

      const result = await signInOTPAction({
        email: parsedEmail.data.email,
        code: parsedCode.data.code,
      });

      if (result?.error === 'AccessDenied') {
        toast.error(t('toast.error.accessDenied'));
        return;
      }

      if (result?.error) {
        toast.error(t('toast.error.generic'));
        return;
      }

      toast.success(t('toast.success'));
      refetch();
      router.push('/');
    } catch (error) {
      toast.error(t('toast.error.somethingWrong'));
    } finally {
      setIsSubmitting(false);
    }
  }, [email, t, refetch, router]);

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
  const t = useTranslations('pages.login.otp');
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
          <CardTitle className='text-2xl'>{t('title')}</CardTitle>
          <CardDescription className='text-base'>
            {t('description')}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <Divider text={t('divider')} />
        <div className='space-y-2 text-center'>
          <p className='text-sm text-muted-foreground'>{t('instructions')}</p>
          <SignInOTP email={email} />
        </div>
      </CardContent>
      <CardFooter className='flex flex-wrap justify-center gap-0 sm:gap-1'>
        <span className='text-sm text-muted-foreground'>{t('resend.prompt')}</span>
        <Button
          onClick={handleClick}
          variant='link'
          className='p-0 h-auto whitespace-normal'
          disabled={!isEnabled}
        >
          {isEnabled ? t('resend.button') : t('resend.timer', { seconds: timeLeft })}
        </Button>
      </CardFooter>
    </Card>
  );
};

export function SignInForm({isGoogle = false, isGithub = false, genericAuthProvider = false}) {
  const t = useTranslations('pages.login');
  const tCommon = useTranslations('common');
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
        if (result?.error === 'AccessDenied') {
          toast.error(t('toast.error.accessDenied'));
        } else {
          toast.error(t('toast.error.generic'));
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
        <CardTitle className='text-2xl'>{tCommon('signIn')}</CardTitle>
        <CardDescription>
          {t('description')}
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
                    <Input type='email' placeholder={t('form.emailPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage className='text-left' />
                </FormItem>
              )}
            />
            <Button type='submit' className='w-full' disabled={!!loginMethod}>
              {loginMethod === 'email'
                ? <Icons.spinner className='me-2 size-4 animate-spin' />
                : <Icons.send className='me-2 size-4' />
              }
              {t('form.loginButton')}
            </Button>
          </form>
        </Form>
        { (isGoogle || isGithub || genericAuthProvider) && (
          <Divider text={t('otp.divider')} />
        ) }
        { (isGithub) && (
          <Button variant='outline' className='w-full' onClick={signInGithub} disabled={!!loginMethod}>
            {loginMethod === 'github'
              ? <Icons.spinner className='me-2 animate-spin' />
              : <Icons.github className='me-2' />
            }
            {t('form.loginWithProvider', { provider: 'Github' })}
          </Button>
        ) }
        { (isGoogle) && (
          <Button variant='outline' className='w-full' onClick={signInGoogle} disabled={!!loginMethod}>
            {loginMethod === 'google'
              ? <Icons.spinner className='me-2 animate-spin' />
              : <Icons.google className='me-2' />
            }
            {t('form.loginWithProvider', { provider: 'Google' })}
          </Button>
        ) }
        { (genericAuthProvider) && (
          <Button variant='outline' className='w-full' onClick={signInGenericOAuth} disabled={!!loginMethod}>
            {loginMethod === genericAuthProvider
              ? <Icons.spinner className='me-2 animate-spin' />
              : (
                genericAuthProvider.toLowerCase() === 'keycloak' ? <Icons.keycloak className='me-2' /> :
                genericAuthProvider.toLowerCase() === 'authentik' ? <Icons.authentik className='me-2' /> :
                <Icons.keyRound className='me-2 text-green-600' />
              )
            }
            {t('form.loginWithProvider', { provider: genericAuthProvider.replace(/\b\w/g, l => l.toUpperCase()) })}
          </Button>
        ) }
      </CardContent>
    </Card>
  );
}
