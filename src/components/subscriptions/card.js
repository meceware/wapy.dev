'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useFormatter, useLocale, useNow } from 'next-intl';
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
import { getPaymentCount, formatPrice } from '@/components/subscriptions/utils';

const SubscriptionDate = ({date, timezone, text, className}) => {
  const t = useTranslations('components.subscriptions.card');
  const formatter = useFormatter();
  const locale = useLocale();
  const now = useNow({
    updateInterval: 1000 * 30,
  });

  const getTimezoneName = (timezone) => {
    try {
      const timezoneName = new Intl.DateTimeFormat(locale, {
        timeZone: timezone,
        timeZoneName: 'long'
      })
        .formatToParts(new Date())
        .find(part => part.type === 'timeZoneName')?.value;

      return timezoneName || timezone;
    } catch {
      return timezone;
    }
  };

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <span className='inline-flex items-center cursor-pointer'>
            {text ? text : formatter.relativeTime(date, {now: now})}
          </span>
        </PopoverTrigger>
        <PopoverContent className='bg-foreground text-background text-sm w-auto max-w-xl wrap-break-word px-4 py-1'>
          {formatter.dateTime(date, {
            year: 'numeric',
            month: 'long',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })}
          {!DateFNS.isEqual(toZonedTime(date, timezone), date) &&
            <span className='text-xs'>
              <br/>
              {t('timezone', { timezone: getTimezoneName(timezone) })}: {formatter.dateTime(toZonedTime(date, timezone), {
                year: 'numeric',
                month: 'long',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          }
        </PopoverContent>
      </Popover>
    </div>
  );
};

const SubscriptionPaymentDate = ({ subscription }) => {
  const t = useTranslations('components.subscriptions.card.paymentDate');

  if (!subscription.enabled) {
    return null;
  }

  const isPast = DateFNS.isPast(subscription.paymentDate);
  return (
    <div className={cn('text-sm text-muted-foreground', {'text-red-500': isPast})}>
      {t.rich(isPast ? 'past' : 'future', {
        date: () => <SubscriptionDate date={subscription.paymentDate} timezone={subscription.timezone} className='text-base text-foreground' />
      })}
    </div>
  );
};

const SubscriptionMarkAsPaid = ({ subscription }) => {
  const t = useTranslations('components.subscriptions.card.markAsPaid');
  const tCommon = useTranslations('common');
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
      toast.success(t('toast.success'));
      router.refresh();
    } else {
      toast.error(t('toast.error'));
    }
  };

  const markAsPaidWithCustomPrice = async () => {
    if (!altOptPrice || isNaN(parseFloat(altOptPrice))) return;

    try {
      setLoading(true);
      const result = await SubscriptionActionMarkAsPaidSessionWithPrice(subscription.id, altOptPrice);
      if (result) {
        altOptReset();
        toast.success(t('toast.custom.success'));
        router.refresh();
      } else {
        toast.error(t('toast.custom.error'));
      }
    } catch (error) {
      toast.error(t('toast.failed'));
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
        toast.success(t('toast.noPrice.success'));
        router.refresh();
      } else {
        toast.error(t('toast.noPrice.error'));
      }
    } catch (error) {
      toast.error(t('toast.failed'));
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
      <div className='text-sm text-muted-foreground'>
        {t.rich('question', {
          action: (chunk) => (
            <Button
              variant='link'
              className='underline p-0 h-auto cursor-pointer'
              title={chunk}
              onClick={markAsPaid}
            >
              {chunk}
            </Button>
          ),
          options: (chunk) => (
            <Button
              variant='link'
              className='underline p-0 h-auto cursor-pointer'
              title={chunk}
              onClick={() => altOptExpanded ? altOptReset() : setAltOptExpanded(true)}
            >
              {chunk}
            </Button>
          )
        })}
      </div>
      {altOptExpanded && (
        <div>
          <div className='flex flex-col gap-4 px-4 py-2 rounded-lg border-s-4 border-s-muted-background'>
            {altOptStep === 'initial' && (
              <>
                <div>
                  <div>
                    <Button
                      variant='link'
                      className='p-0 h-auto cursor-pointer'
                      onClick={() => setAltOptStep('customPrice')}
                    >
                      {t('customPrice.title')}
                    </Button>
                    <p className='text-xs text-muted-foreground'>
                      {t('customPrice.description')}
                    </p>
                  </div>
                </div>
                <div>
                  <Button
                    variant='link'
                    className='p-0 h-auto cursor-pointer'
                    onClick={() => setAltOptStep('noPrice')}
                  >
                    {t('noPrice.title')}
                  </Button>
                  <p className='text-xs text-muted-foreground'>
                    {t('noPrice.description')}
                  </p>
                </div>
              </>
            )}
            {altOptStep === 'customPrice' && (
              <div className='space-y-2'>
                <p className='text-sm font-medium text-foreground'>
                  {t('customPrice.prompt')}
                </p>
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
                    {tCommon('cancel')}
                  </Button>
                  <Button
                    size='sm'
                    disabled={!altOptPrice || isNaN(parseFloat(altOptPrice)) || loading}
                    onClick={() => markAsPaidWithCustomPrice()}
                  >
                    {loading ? (
                      <Icons.spinner className='animate-spin' />
                    ) : (
                      tCommon('confirm')
                    )}
                  </Button>
                </div>
              </div>
            )}
            {altOptStep === 'noPrice' && (
              <div className='space-y-2'>
                <p className='text-sm font-medium text-foreground'>
                  {t('noPrice.prompt')}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {t('noPrice.warning')}
                </p>
                <div className='flex justify-end gap-2'>
                  <Button variant='outline' size='sm' onClick={altOptReset}>
                    {tCommon('cancel')}
                  </Button>
                  <Button
                    size='sm'
                    disabled={loading}
                    onClick={() => markAsPaidWithNoPrice()}
                  >
                    {loading ? (
                      <Icons.spinner className='animate-spin' />
                    ) : (
                      tCommon('confirm')
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
  const t = useTranslations('components.subscriptions.card.notifications');
  const formatter = useFormatter();

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
    ) || [];

    if (nextNotificationDetails.length !== 0) {
      const nextNotificationIsRepeat = subscription.nextNotificationDetails?.isRepeat ? true : false;
      const isSoon = DateFNS.isPast(subscription.nextNotificationTime);

      const translatedChannels = nextNotificationDetails.map((type) => {
        const lower = type.toLowerCase();
        const label = [
          'push',
          'email',
          'webhook',
          'ntfy',
          'discord',
          'slack'
        ].find(k => lower.includes(k)) || lower;

        return (
          <span key={label} className='text-base text-foreground'>
            {t(`types.${label}`)}
          </span>
        );
      });

      const channelList = formatter.list(translatedChannels, {
        type: 'conjunction',
        style: 'long'
      });

      return (
        <div className='text-sm text-muted-foreground'>
          {t.rich(nextNotificationIsRepeat
            ? isSoon
              ? 'willBeRemindedSoon'
              : 'willBeRemindedAt'
            : isSoon
              ? 'willBeNotifiedSoon'
              : 'willBeNotifiedAt', {
            date: () => (
              <SubscriptionDate
                date={subscription.nextNotificationTime}
                timezone={subscription.timezone}
                className='text-base text-foreground'
              />
            ),
            channels: channelList
          })}
        </div>
      );
    }
  }

  return (
    <div>
      <span className='text-sm text-muted-foreground'>
        {t('wontBeNotified')}
      </span>
    </div>
  );
};

const SubscriptionPaymentCount = ({ subscription }) => {
  const t = useTranslations('components.subscriptions.card.paymentCount');
  const tCard = useTranslations('components.subscriptions.card');
  const formatter = useFormatter();
  const locale = useLocale();

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
        <span className='text-sm text-muted-foreground'>
          {t('congratulations')}
        </span>
      </div>
    );
  }

  // Get localized timezone name
  const getTimezoneName = (timezone) => {
    try {
      const timezoneName = new Intl.DateTimeFormat(locale, {
        timeZone: timezone,
        timeZoneName: 'long',
      })
        .formatToParts(new Date())
        .find(part => part.type === 'timeZoneName')?.value;

      return timezoneName || timezone;
    } catch {
      return timezone;
    }
  };

  const dateUntil = subscription.untilDate;
  const zonedUntil = toZonedTime(subscription.untilDate, subscription.timezone);

  return (
    <div className='text-sm text-muted-foreground'>
      {t.rich('remaining', {
        count: paymentCount,
        trigger: (chunks) => (
          <Popover>
            <PopoverTrigger asChild>
              <span className='inline-flex cursor-pointer text-base text-foreground'>
                {chunks}
              </span>
            </PopoverTrigger>
            <PopoverContent className='bg-foreground text-background text-sm w-auto max-w-xl px-4 py-1'>
              {t('until', {
                date: formatter.dateTime(dateUntil, {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric'
                })
              })}
              {!DateFNS.isEqual(zonedUntil, dateUntil) &&
                <span className='text-xs'>
                  <br/>
                  {tCard('timezone', { timezone: getTimezoneName(subscription.timezone) })}: {formatter.dateTime(zonedUntil, {
                    year: 'numeric',
                    month: 'long',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              }
            </PopoverContent>
          </Popover>
        )
      })}
    </div>
  );
};

const SubscriptionPaymentMethods = ({ subscription }) => {
  const t = useTranslations('components.subscriptions.card.paymentMethods');
  const formatter = useFormatter();

  if (!subscription.enabled) {
    return null;
  }

  const paymentMethods = subscription.paymentMethods || [];

  if (paymentMethods?.length === 0) {
    return null;
  }

  const methodElements = paymentMethods.map((paymentMethod, index) => (
    <div key={`${paymentMethod.name}-${index}`} className='inline-flex gap-1 items-center align-bottom'>
      <LogoIcon
        icon={paymentMethod.icon ? JSON.parse(paymentMethod.icon) : false}
        className='size-5'
      />
      <span className='text-base text-foreground'>{paymentMethod.name}</span>
    </div>
  ));

  const list = formatter.list(methodElements, {
    type: 'conjunction',
    style: 'long'
  });

  return (
    <div className='text-sm text-muted-foreground'>
      {t.rich('paidVia', {
        methods: list
      })}
    </div>
  );
};

const SubscriptionPastPaymentCount = ({ subscription }) => {
  const t = useTranslations('components.subscriptions.card.pastPayments');
  const paymentCount = subscription?._count?.pastPayments || 0;

  if (paymentCount === 0) {
    return false;
  }

  return (
    <div className='text-sm text-muted-foreground'>
      {t.rich('count', {
        count: paymentCount,
        highlight: (chunks) => (
          <span className='text-base text-foreground'>
            {chunks}
          </span>
        )
      })}
    </div>
  );
};

const NotificationIcon = ({ type, isEnabled, IconComponent, isVisible = true }) => {
  const t = useTranslations('components.subscriptions.card.actions');

  if (!isVisible) {
    return null;
  }

  const title = isEnabled
    ? t('notificationEnabled', { type })
    : t('notificationDisabled', { type });

  return (
    <div title={title}>
      <IconComponent
        className={cn(
          'size-5',
          {'text-green-500': isEnabled},
          {'text-red-500 opacity-50': !isEnabled}
        )}
      />
    </div>
  );
};

export const SubscriptionCard = ({ subscription, externalServices }) => {
  const t = useTranslations('components.subscriptions.card');
  const tCommon = useTranslations('common');
  const tCycle = useTranslations('components.subscriptions.cycles');
  const tNotifications = useTranslations('components.subscriptions.form.fields.notifications.types');
  const parsedIcon = subscription.logo ? JSON.parse(subscription.logo) : false;
  const categories = subscription.categories || [];
  const isPushEnabled = subscription.enabled && subscription.notifications.some(notification => notification.type.includes('PUSH'));
  const isEmailEnabled = subscription.enabled && subscription.notifications.some(notification => notification.type.includes('EMAIL'));
  const isNtfySettingsEnabled = !!(externalServices?.ntfy?.enabled && externalServices?.ntfy?.url);
  const isNtfyEnabled = subscription.enabled && isNtfySettingsEnabled && subscription.notifications.some(notification => notification.type.includes('NTFY'));
  const isWebhookSettingsEnabled = !!(externalServices?.webhook?.enabled && externalServices?.webhook?.url);
  const isWebHookEnabled = subscription.enabled && isWebhookSettingsEnabled && subscription.notifications.some(notification => notification.type.includes('WEBHOOK'));
  const isDiscordSettingsEnabled = !!(externalServices?.discord?.enabled && externalServices?.discord?.url);
  const isDiscordEnabled = subscription.enabled && isDiscordSettingsEnabled && subscription.notifications.some(notification => notification.type.includes('DISCORD'));
  const isSlackSettingsEnabled = !!(externalServices?.slack?.enabled && externalServices?.slack?.url);
  const isSlackEnabled = subscription.enabled && isSlackSettingsEnabled && subscription.notifications.some(notification => notification.type.includes('SLACK'));

  return (
    <Card className='w-full hover:shadow-lg transition-shadow duration-200 flex flex-col'>
      <CardHeader className='pt-4'>
        <div className='flex items-start justify-between gap-2'>
          <div className='flex flex-col gap-1 text-left grow overflow-hidden'>
            <div className='inline-flex items-center gap-2'>
              <CardTitle className='text-2xl truncate'>
                <Link href={`/view/${subscription.id}`}>
                  {subscription.name}
                </Link>
              </CardTitle>
            </div>
            <div className='w-full text-sm text-muted-foreground truncate'>
              <span className='font-medium text-lg text-foreground'>
                {formatPrice(subscription.price, subscription.currency, locale)}
              </span>
              <span className='ms-1'>
                / {tCycle(subscription.cycle.time, { count: subscription.cycle.every })}
              </span>
            </div>
          </div>
          <div className='relative shrink-0 size-16 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-800'>
            <div className={cn('size-4 rounded-full absolute top-0 end-0 ring-2 ring-background', {'bg-green-600': subscription.enabled}, {'bg-red-600': !subscription.enabled})}>
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
                {t('actions.inactive')}
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
            <NotificationIcon
              type={tNotifications('push.label')}
              isEnabled={isPushEnabled}
              IconComponent={Icons.bellRing}
            />
            <NotificationIcon
              type={tNotifications('email.label')}
              isEnabled={isEmailEnabled}
              IconComponent={Icons.mail}
            />
            <NotificationIcon
              type={tNotifications('ntfy.label')}
              isEnabled={isNtfyEnabled}
              isVisible={isNtfySettingsEnabled}
              IconComponent={Icons.ntfy}
            />
            <NotificationIcon
              type={tNotifications('webhook.label')}
              isEnabled={isWebHookEnabled}
              isVisible={isWebhookSettingsEnabled}
              IconComponent={Icons.webhook}
            />
            <NotificationIcon
              type={tNotifications('discord.label')}
              isEnabled={isDiscordEnabled}
              isVisible={isDiscordSettingsEnabled}
              IconComponent={Icons.discord}
            />
            <NotificationIcon
              type={tNotifications('slack.label')}
              isEnabled={isSlackEnabled}
              isVisible={isSlackSettingsEnabled}
              IconComponent={Icons.slack}
            />
            {subscription.url && (
              <>
                <Separator orientation='vertical' className='h-5' />
                <Link
                  href={subscription.url}
                  title={t('actions.link', { url: subscription.url })}
                  className='text-sm text-muted-foreground truncate flex items-center gap-1 shrink-0' target='_blank'
                >
                  <Icons.link className='size-4' />
                  <span className='sr-only'>{t('actions.link', { url: subscription.url })}</span>
                </Link>
              </>
            )}
          </div>
          <div className='flex items-center'>
            <Button variant='outline' size='sm' className='text-muted-foreground' asChild>
              <Link href={`/edit/${subscription.id}`} title={t('actions.edit', { name: subscription.name })}>
                <Icons.edit /> {tCommon('edit')}
                <span className='sr-only'>{t('actions.edit', { name: subscription.name })}</span>
              </Link>
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
