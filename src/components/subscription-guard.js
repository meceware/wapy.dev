'use server';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { PADDLE_STATUS_MAP, paddleIsValid } from '@/lib/paddle/enum';

export const SubscriptionGuard = async ({ children, paddleStatus }) => {
  if (!paddleStatus?.enabled || paddleIsValid(paddleStatus?.status)) {
    return <>{children}</>;
  }

  return (
    <>
      <div className='absolute z-10 -m-[0.25rem] inset-0 flex flex-col items-center grow backdrop-blur-sm bg-background/70'>
        <Card className='w-full max-w-md sticky top-20 mt-4'>
          <CardHeader>
            <CardTitle>Subscription Required</CardTitle>
            <CardDescription>
              {paddleStatus?.status === PADDLE_STATUS_MAP.trialExpired ? (
                'Your trial period has expired.'
              ) : paddleStatus?.status === PADDLE_STATUS_MAP.cancelled ? (
                'Your subscription has been cancelled.'
              ) : paddleStatus?.status === PADDLE_STATUS_MAP.past_due ? (
                'Your payment is past due.'
              ) : paddleStatus?.status === PADDLE_STATUS_MAP.paused ? (
                'Your subscription has been paused.'
              ) : (
                'You need an active subscription to access this feature.'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              Please visit your account page to manage your subscription and continue using all features.
            </p>
          </CardContent>
          <CardFooter className='flex justify-center'>
            <Button asChild>
              <Link href='/account'>
                <Icons.settings />
                Go to Account Settings
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      {children}
    </>
  );
};
