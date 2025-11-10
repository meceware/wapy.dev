'use client';

import { useState, useEffect, useRef, Fragment } from 'react';
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
import {
  SubscriptionActionMarkAsPaidSession,
  SubscriptionActionMarkAsPaidSessionWithPrice,
  SubscriptionActionMarkAsPaidSessionNoPrice,
} from '@/components/subscriptions/actions';
import { LogoIcon } from '@/components/ui/icon-picker';
import { toZonedTime } from 'date-fns-tz';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
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
  const [altOptExpanded, setAltOptExpanded] = useState(false);
  const [altOptStep, setAltOptStep] = useState('initial');
  const [altOptPrice, setAltOptPrice] = useState(subscription.price || '');
  const [loading, setLoading] = useState(false);
  const customPriceInputRef = useRef();

  if (!subscription.enabled) {
    return null;
  }

  const altOptReset = () => {
    setAltOptExpanded(false);
    setAltOptStep('initial');
    setAltOptPrice(subscription.price || '');
  };

  const markAsPaid = async () => {
    altOptReset();
    const result = await SubscriptionActionMarkAsPaidSession(subscription.id);
    if (result) {
      // Force a revalidation of this component
      toast.success('Subscription marked as paid!');
      router.refresh();
    } else {
      toast.error('Error marking subscription as paid');
    }
  };

  const markAsPaidWithCustomPrice = async () => {
    if (!altOptPrice || isNaN(parseFloat(altOptPrice))) return;

    try {
      setLoading(true);
      const result = await SubscriptionActionMarkAsPaidSessionWithPrice(subscription.id, altOptPrice);
      if (result) {
        altOptReset();
        toast.success('Subscription marked as paid with custom price!');
        router.refresh();
      } else {
        toast.error('Error marking subscription as paid with custom price');
      }
    } catch (error) {
      toast.error('Failed to update!');
    } finally {
      setLoading(false);
    }
  };

  const markAsPaidWithNoPrice = async () => {
    try {
      setLoading(true);
      const result = await SubscriptionActionMarkAsPaidSessionNoPrice(subscription.id, altOptPrice);
      if (result) {
        altOptReset();
        toast.success('Subscription marked as paid without payment!');
        router.refresh();
      } else {
        toast.error('Error marking subscription as paid without payment');
      }
    } catch (error) {
      toast.error('Failed to update!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (altOptStep === 'customPrice' && customPriceInputRef.current) {
      customPriceInputRef.current.focus();
    }
  }, [altOptStep]);

  return (
    <>
      <div>
        <span className='text-sm text-muted-foreground'>Did you pay this?</span>
        {' '}
        <Button variant='link' className='underline p-0 h-auto cursor-pointer' title='Mark As Paid' onClick={markAsPaid}>
          Mark as paid
        </Button>
        {' '}
        <span className='text-sm text-muted-foreground'>or see</span>
        {' '}
        <Button variant='link' className='underline p-0 h-auto cursor-pointer' title='Mark As Paid' onClick={() => altOptExpanded ? altOptReset() : setAltOptExpanded(true)}>
          other options
        </Button>
        {'.'}
      </div>
      {altOptExpanded && (
        <div>
          <div className='flex flex-col gap-4 px-4 py-2 rounded-lg border-l-4 border-l-muted-background'>
            {altOptStep === 'initial' && (
              <>
                <div>
                  <div>
                    <Button
                      variant='link'
                      className='p-0 h-auto cursor-pointer'
                      onClick={() => setAltOptStep('customPrice')}
                    >
                      Paid a different amount?
                    </Button>
                    <p className='text-xs text-muted-foreground'>
                      Use this if you paid more or less than usual
                    </p>
                  </div>
                </div>
                <div>
                  <Button
                    variant='link'
                    className='p-0 h-auto cursor-pointer'
                    onClick={() => setAltOptStep('noPrice')}
                  >
                    Just mark as paid!
                  </Button>
                  <p className='text-xs text-muted-foreground'>
                    Use this to skip this payment without recording an amount
                  </p>
                </div>
              </>
            )}
            {altOptStep === 'customPrice' && (
              <div className='space-y-2'>
                <p className='text-sm font-medium text-foreground'>Enter the amount you paid:</p>
                <Input
                  ref={customPriceInputRef}
                  type='number'
                  step='0.01'
                  min='0'
                  placeholder={subscription.price}
                  className='text-sm'
                  value={altOptPrice}
                  onChange={(e) => setAltOptPrice(e.target.value)}
                />
                <div className='flex justify-end gap-2'>
                  <Button variant='outline' size='sm' onClick={altOptReset}>
                    Cancel
                  </Button>
                  <Button
                    size='sm'
                    disabled={!altOptPrice || isNaN(parseFloat(altOptPrice)) || loading}
                    onClick={() => markAsPaidWithCustomPrice()}
                  >
                    {loading ? (
                      <Icons.spinner className='animate-spin' />
                    ) : (
                      'Confirm'
                    )}
                  </Button>
                </div>
              </div>
            )}
            {altOptStep === 'noPrice' && (
              <div className='space-y-2'>
                <p className='text-sm font-medium text-foreground'>Mark as paid without tracking the amount?</p>
                <p className='text-xs text-muted-foreground'>
                  This will not record a payment amount.
                </p>
                <div className='flex justify-end gap-2'>
                  <Button variant='outline' size='sm' onClick={altOptReset}>
                    Cancel
                  </Button>
                  <Button
                    size='sm'
                    disabled={loading}
                    onClick={() => markAsPaidWithNoPrice()}
                  >
                    {loading ? (
                      <Icons.spinner className='animate-spin' />
                    ) : (
                      'Confirm'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const SubscriptionIsNotified = ({ subscription, externalServices }) => {
  const isNtfySettingsEnabled = externalServices?.ntfy?.enabled && externalServices?.ntfy?.url;
  const isWebhookSettingsEnabled = externalServices?.webhook?.enabled && externalServices?.webhook?.url;
  const isDiscordSettingsEnabled = externalServices?.discord?.enabled && externalServices?.discord?.url;
  const isSlackSettingsEnabled = externalServices?.slack?.enabled && externalServices?.slack?.url;

  if (subscription.enabled && subscription.nextNotificationTime) {
    const nextNotificationDetails = subscription.nextNotificationDetails?.type?.filter(type =>
      (type !== 'WEBHOOK' || isWebhookSettingsEnabled) &&
      (type !== 'NTFY' || isNtfySettingsEnabled) &&
      (type !== 'DISCORD' || isDiscordSettingsEnabled) &&
      (type !== 'SLACK' || isSlackSettingsEnabled)
    );
    const nextNotificationIsRepeat = subscription.nextNotificationDetails?.isRepeat ? true : false;

    if (nextNotificationDetails.length !== 0) {
      return (
        <div>
          <span className='text-sm text-muted-foreground'>
            {nextNotificationIsRepeat
              ? 'You will be reminded'
              : 'You will be notified'
            }
            {' '}
          </span>
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
            if (type.toLowerCase().includes('ntfy')) label = 'ntfy';
            if (type.toLowerCase().includes('discord')) label = 'discord';
            if (type.toLowerCase().includes('slack')) label = 'slack';

            return (
              <div key={type} className='inline'>
                <span className='text-sm text-muted-foreground'>{separator}</span>
                <span>{label}</span>
              </div>
            );
          })}
          {nextNotificationIsRepeat && (
            <span className='text-sm text-muted-foreground'>{' '}again</span>
          )}
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
              <LogoIcon icon={paymentMethod.icon ? JSON.parse(paymentMethod.icon) : false} className='size-5' />
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

export const SubscriptionCard = ({ subscription, externalServices }) => {
  const parsedIcon = subscription.logo ? JSON.parse(subscription.logo) : false;
  const categories = subscription.categories || [];
  const isPushEnabled = subscription.enabled && subscription.notifications.some(notification => notification.type.includes('PUSH'));
  const isEmailEnabled = subscription.enabled && subscription.notifications.some(notification => notification.type.includes('EMAIL'));
  const isNtfySettingsEnabled = externalServices?.ntfy?.enabled && externalServices?.ntfy?.url;
  const isNtfyEnabled = subscription.enabled && isNtfySettingsEnabled && subscription.notifications.some(notification => notification.type.includes('NTFY'));
  const isWebhookSettingsEnabled = externalServices?.webhook?.enabled && externalServices?.webhook?.url;
  const isWebHookEnabled = subscription.enabled && isWebhookSettingsEnabled && subscription.notifications.some(notification => notification.type.includes('WEBHOOK'));
  const isDiscordSettingsEnabled = externalServices?.discord?.enabled && externalServices?.discord?.url;
  const isDiscordEnabled = subscription.enabled && isDiscordSettingsEnabled && subscription.notifications.some(notification => notification.type.includes('DISCORD'));
  const isSlackSettingsEnabled = externalServices?.slack?.enabled && externalServices?.slack?.url;
  const isSlackEnabled = subscription.enabled && isSlackSettingsEnabled && subscription.notifications.some(notification => notification.type.includes('SLACK'));

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
              <SubscriptionIsNotified subscription={subscription} externalServices={externalServices} />
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
            {isNtfySettingsEnabled && (
              <div title={`Ntfy notifications are ${isNtfyEnabled ? 'enabled' : 'disabled'}`}>
                <Icons.ntfy className={
                  cn(
                    'size-5',
                    {'text-green-500': isNtfyEnabled},
                    {'text-red-500 opacity-50': !isNtfyEnabled}
                  )
                }/>
              </div>
            )}
            {isWebhookSettingsEnabled && (
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
            {isDiscordSettingsEnabled && (
              <div title={`Discord notifications are ${isDiscordEnabled ? 'enabled' : 'disabled'}`}>
                <Icons.discord className={
                  cn(
                    'size-5',
                    {'text-green-500': isDiscordEnabled},
                    {'text-red-500 opacity-30': !isDiscordEnabled}
                  )
                }/>
              </div>
            )}
            {isSlackSettingsEnabled && (
              <div title={`Slack notifications are ${isSlackEnabled ? 'enabled' : 'disabled'}`}>
                <Icons.slack className={
                  cn(
                    'size-5',
                    {'text-green-500': isSlackEnabled},
                    {'text-red-500 opacity-30': !isSlackEnabled}
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
