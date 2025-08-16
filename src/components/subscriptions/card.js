'use client';

import { Fragment } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as DateFNS from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SubscriptionActionMarkAsPaidSession } from '@/components/subscriptions/actions';
import { LogoIcon } from '@/components/ui/icon-picker';
import { toZonedTime } from 'date-fns-tz';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { getCycleLabel, getPaymentCount, formatPrice } from '@/components/subscriptions/utils';

const SubscriptionDate = ({date, timezone, text}) => {
  return (
    <div className='inline-flex items-center gap-1'>
      <Popover>
        <PopoverTrigger asChild>
          <span className='inline-flex items-center cursor-pointer'>
            {text ? text : DateFNS.formatDistanceToNowStrict(date, {addSuffix: true})}
          </span>
        </PopoverTrigger>
        <PopoverContent className='bg-foreground text-background text-sm w-auto max-w-xl break-words px-4 py-1'>
          {DateFNS.format(date, 'dd MMMM yyyy, HH:mm')}
          {!DateFNS.isEqual(toZonedTime(date, timezone), date) &&
            <span className='text-xs'>
              <br/>
              {timezone} Timezone: {DateFNS.format(toZonedTime(date, timezone), 'dd MMMM yyyy, HH:mm')}
            </span>
          }
        </PopoverContent>
      </Popover>
    </div>
  );
};

const SubscriptionPaymentDate = ({ subscription }) => {
  if (!subscription.enabled) {
    return null;
  }

  const isPast = DateFNS.isPast(subscription.paymentDate);
  return (
    <div className={cn({'text-red-500': isPast})}>
      <span className='text-sm text-muted-foreground'>{isPast ? 'Should have been paid' : 'Will be paid'}</span>
      {' '}
      <SubscriptionDate date={subscription.paymentDate} timezone={subscription.timezone} />
      <span className='text-sm text-muted-foreground'>.</span>
    </div>
  );
};

const SubscriptionMarkAsPaid = ({ subscription }) => {
  const router = useRouter();

  if (!subscription.enabled) {
    return null;
  }

  const markAsPaid = async () => {
    const result = await SubscriptionActionMarkAsPaidSession(subscription.id);
    if (result) {
      // Force a revalidation of this component
      toast.success('Subscription marked as paid!');
      router.refresh();
    } else {
      toast.error('Error marking subscription as paid');
    }
  };

  return (
    <div>
      <span className='text-sm text-muted-foreground'>Did you pay this?</span>
        {' '}
        <Button variant='link' className='underline p-0 h-auto cursor-pointer' onClick={markAsPaid}>
          Mark as paid
        </Button>
    </div>
  );
}

const SubscriptionIsNotified = ({ subscription, settings }) => {
  if (subscription.enabled && subscription.nextNotificationTime) {
    const nextNotificationDetails = subscription.nextNotificationDetails?.type?.filter(
      type => type !== 'WEBHOOK' || settings?.webhook
    ) ?? [];

    if (nextNotificationDetails.length !== 0) {
      return (
        <div>
          <span className='text-sm text-muted-foreground'>You will be notified </span>
          {' '}
          <SubscriptionDate date={subscription.nextNotificationTime} timezone={subscription.timezone} text={DateFNS.isPast(subscription.nextNotificationTime) ? 'soon' : undefined} />
          {nextNotificationDetails.map((type, index) => {
            const isLast = index === nextNotificationDetails.length - 1;
            const separator =
              index === 0
                ? ' via '
                : isLast
                ? ' and '
                : ', ';

            let label = '';
            if (type.toLowerCase().includes('push')) label = 'notification';
            if (type.toLowerCase().includes('email')) label = 'email';
            if (type.toLowerCase().includes('webhook')) label = 'webhook';

            return (
              <div key={type} className='inline'>
                <span className='text-muted-foreground'>{separator}</span>
                <span>{label}</span>
              </div>
            );
          })}
          <span className='text-muted-foreground'>.</span>
        </div>
      );
    }
  }

  return (
    <div>
      <span className='text-sm text-muted-foreground'>You won&apos;t be notified.</span>
    </div>
  );
};

const SubscriptionPaymentCount = ({ subscription }) => {
  if (!subscription.untilDate || !subscription.enabled) {
    return null;
  }

  const paymentCount = getPaymentCount(
    toZonedTime(subscription.paymentDate, subscription.timezone),
    toZonedTime(subscription.untilDate, subscription.timezone),
    subscription.cycle
  );

  if (paymentCount === 0) {
    return (
      <div>
        <span className='text-sm text-muted-foreground'>Congratulations! You have paid all.</span>
      </div>
    );
  }

  return (
    <div>
      <span className='text-sm text-muted-foreground'>You will pay this</span>
      {' '}
      <Popover>
        <PopoverTrigger asChild>
          <div className='inline-flex cursor-pointer'>
            {paymentCount} {paymentCount === 1 ? 'more time' : 'times'}
            <span className='text-muted-foreground'>.</span>
          </div>
        </PopoverTrigger>
        <PopoverContent className='bg-foreground text-background text-sm w-auto max-w-xl break-words px-4 py-1'>
          Until
          {' '}
          {DateFNS.format(subscription.untilDate, 'dd MMMM yyyy, HH:mm')}
          {!DateFNS.isEqual(toZonedTime(subscription.untilDate, subscription.timezone), subscription.untilDate) &&
            <span className='text-xs'>
              <br/>
              {subscription.timezone} Timezone: {DateFNS.format(toZonedTime(subscription.untilDate, subscription.timezone), 'dd MMMM yyyy, HH:mm')}
            </span>
          }
        </PopoverContent>
      </Popover>
    </div>
  );
};

const SubscriptionPaymentMethods = ({ subscription }) => {
  if (!subscription.enabled) {
    return null;
  }

  const paymentMethods = subscription.paymentMethods || [];

  if (paymentMethods?.length === 0) {
    return null;
  }

  return (
    <div>
      <span className='text-sm text-muted-foreground'>This will be paid</span>
      {' '}
      {paymentMethods.map((paymentMethod, index) => {
        const isLast = index === paymentMethods.length - 1;
        const separator =
          index === 0
            ? ' via '
            : isLast
            ? ' and '
            : ', ';

        return (
          <Fragment key={`pm-${index}`}>
            <span className='text-sm text-muted-foreground'>{separator}</span>
            <div key={paymentMethod.name} className='inline-flex gap-1 align-bottom items-center'>
              <LogoIcon icon={paymentMethod.icon ? JSON.parse(paymentMethod.icon) : false} className='size-4' />
              <span>{paymentMethod.name}</span>
            </div>
          </Fragment>
        );
      })}
      <span className='text-muted-foreground'>.</span>
    </div>
  );
};

const SubscriptionPastPaymentCount = ({ subscription }) => {
  const paymentCount = subscription?._count?.pastPayments || 0;

  if (paymentCount === 0) {
    return false;
  }

  return (
    <div>
      <span className='text-sm text-muted-foreground'>You have made</span>
      {' '}
      {paymentCount} {paymentCount === 1 ? 'payment' : 'payments'}
      {' '}
      <span className='text-sm text-muted-foreground'>so far.</span>
    </div>
  );
};

export const SubscriptionCard = ({ subscription, settings }) => {
  const parsedIcon = subscription.logo ? JSON.parse(subscription.logo) : false;
  const categories = subscription.categories || [];
  const isPushEnabled = subscription.enabled && subscription.notifications.some(notification => notification.type.includes('PUSH'));
  const isEmailEnabled = subscription.enabled && subscription.notifications.some(notification => notification.type.includes('EMAIL'));
  const isWebHookEnabled = subscription.enabled && settings?.webhook && subscription.notifications.some(notification => notification.type.includes('WEBHOOK'));

  return (
    <Card className='w-full hover:shadow-lg transition-shadow duration-200 flex flex-col'>
      <CardHeader className='pt-4'>
        <div className='flex items-start justify-between gap-2'>
          <div className='flex flex-col gap-1 text-left grow overflow-hidden'>
            <div className='inline-flex items-center gap-2'>
              <CardTitle className='text-2xl truncate'><Link href={`/view/${subscription.id}`}>{subscription.name}</Link></CardTitle>
            </div>
            <div className='w-full text-sm text-muted-foreground truncate'>
              <span className='font-medium text-lg text-foreground'>{formatPrice(subscription.price, subscription.currency)}</span>
              <span className='ml-1'>
                / {getCycleLabel(subscription.cycle)}
              </span>
            </div>
          </div>
          <div className='relative shrink-0 size-16 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-800'>
            <div className={cn('size-4 rounded-full absolute top-0 right-0 ring-2 ring-background', {'bg-green-600': subscription.enabled}, {'bg-red-600': !subscription.enabled})}>
            </div>
            <LogoIcon icon={parsedIcon}>
              <span className='text-2xl'>{subscription.name[0].toUpperCase()}</span>
            </LogoIcon>
          </div>
        </div>
      </CardHeader>
      <CardContent className='grow'>
        <div className='flex flex-col gap-2 items-start justify-center text-left'>
          {subscription.enabled ? (
            <>
              <SubscriptionPaymentDate subscription={subscription} />
              <SubscriptionMarkAsPaid subscription={subscription} />
              <SubscriptionPaymentCount subscription={subscription} />
              <SubscriptionPaymentMethods subscription={subscription} />
              <SubscriptionPastPaymentCount subscription={subscription} />
              <SubscriptionIsNotified subscription={subscription} settings={settings} />
            </>
          ) : (
            <>
              <div className='text-sm text-muted-foreground'>
                This subscription is inactive.
              </div>
              <SubscriptionPastPaymentCount subscription={subscription} />
            </>
          )}
          {subscription.notes && (
            <div className='text-sm text-muted-foreground whitespace-pre-wrap'>
              {subscription.notes}
            </div>
          )}

        </div>
      </CardContent>
      <CardFooter className='flex-col gap-4 pb-4'>
        {categories?.length > 0 && (
          <div className='flex flex-wrap gap-1 w-full'>
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant='outline'
                style={{
                  color: category.color,
                  borderColor: category.color,
                }}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        )}
        <Separator />
        <div className='flex items-center justify-between gap-2 w-full'>
          <div className='flex items-center gap-3'>
            <div title={`Push notifications are ${isPushEnabled ? 'enabled' : 'disabled'}`}>
              <Icons.bellRing className={
                cn(
                  'size-5',
                  {'text-green-500': isPushEnabled},
                  {'text-red-500 opacity-50': !isPushEnabled}
                )
              }/>
            </div>
            <div title={`Email notifications are ${isEmailEnabled ? 'enabled' : 'disabled'}`}>
              <Icons.mail className={
                cn(
                  'size-5',
                  {'text-green-500': isEmailEnabled},
                  {'text-red-500 opacity-50': !isEmailEnabled}
                )
              }/>
            </div>
            {settings?.webhook && (
              <div title={`Webhook notifications are ${isWebHookEnabled ? 'enabled' : 'disabled'}`}>
                <Icons.webhook className={
                  cn(
                    'size-5',
                    {'text-green-500': isWebHookEnabled},
                    {'text-red-500 opacity-50': !isWebHookEnabled}
                  )
                }/>
              </div>
            )}
            { subscription.url && (
              <>
                <Separator orientation='vertical' className='h-5' />
                <Link href={subscription.url} title={`Link to ${subscription.url}`} className='text-sm text-muted-foreground truncate flex items-center gap-1 shrink-0' target='_blank'>
                  <Icons.link className='size-4' />
                  <span className='sr-only'>Link to {subscription.url}</span>
                </Link>
              </>
            )}
          </div>
          <div className='flex items-center'>
            <Button variant='outline' size='sm' className='text-muted-foreground' asChild>
              <Link href={`/edit/${subscription.id}`} title='Edit Subscription'>
                <Icons.edit /> Edit
                <span className='sr-only'>Edit Subscription {subscription.name}</span>
              </Link>
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
