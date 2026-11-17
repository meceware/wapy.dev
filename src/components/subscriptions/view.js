'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useTranslations, useFormatter, useLocale } from 'next-intl';
import {
  addMonths,
  differenceInDays,
  addYears,
  isBefore,
  isPast,
  isEqual,
  formatDistanceStrict,
  differenceInMinutes,
} from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { LogoIcon } from '@/components/ui/icon-picker';
import {
  SubscriptionGetUpcomingPayments,
  SubscriptionGetNextFuturePaymentDate,
} from '@/components/subscriptions/lib';
import { getPaymentCount, formatPrice } from '@/components/subscriptions/utils';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function SubscriptionView({ subscription, externalServices }) {
  const t = useTranslations('components.view');
  const locale = useLocale();
  const tCycle = useTranslations('components.subscriptions.cycles');
  const tCommon = useTranslations('common');
  const formatter = useFormatter();
  const parsedIcon = subscription.logo ? JSON.parse(subscription.logo) : false;
  const maxUpcomingPayments = 20;

  // Calculate statistics
  const stats = useMemo(() => {
    if (!subscription || !subscription.enabled) {
      return {
        payments: [],
        nextPaymentDate: null,
        unpaidPayments: { count: 0, total: 0 },
        totalCost: 0,
        daysUntilNextPayment: null,
        monthlyCost: 0,
        quarterlyCost: 0,
        yearlyCost: 0,
        remainingPayments: null,
      };
    }

    const now = new Date();
    const endDate = subscription.untilDate && isBefore(subscription.untilDate, addYears(now, 1))
      ? subscription.untilDate
      : addYears(now, 1);
    const payments = SubscriptionGetUpcomingPayments(subscription, endDate);
    const nextPaymentDate = SubscriptionGetNextFuturePaymentDate(subscription);

    // Calculate monthly, quarterly, and yearly costs
    const monthlyPayments = payments.filter(p => isBefore(p.date, addMonths(now, 1)));
    const quarterlyPayments = payments.filter(p => isBefore(p.date, addMonths(now, 3)));
    const yearlyPayments = payments.filter(p => isBefore(p.date, addMonths(now, 12)));

    const monthlyCost = monthlyPayments.reduce((sum, p) => isPast(p.date) ? sum : sum + p.price, 0);
    const quarterlyCost = quarterlyPayments.reduce((sum, p) => isPast(p.date) ? sum : sum + p.price, 0);
    const yearlyCost = yearlyPayments.reduce((sum, p) => isPast(p.date) ? sum : sum + p.price, 0);

    // Calculate remaining payments if until date exists
    const remainingPayments = subscription.untilDate ? getPaymentCount(
      toZonedTime(subscription.paymentDate, subscription.timezone),
      toZonedTime(subscription.untilDate, subscription.timezone),
      subscription.cycle
    ) : null;

    return {
      nextPaymentDate: nextPaymentDate,
      unpaidPayments: payments.reduce(
        (result, p) => {
          if (isPast(p.date)) {
            return {
              count: result.count + 1,
              total: result.total + p.price
            };
          }
          return result;
        },
        { count: 0, total: 0 }
      ),
      totalCost: payments.reduce((sum, p) => sum + p.price, 0),
      daysUntilNextPayment: nextPaymentDate ? differenceInDays(nextPaymentDate, now) : null,
      monthlyCost,
      quarterlyCost,
      yearlyCost,
      payments,
      remainingPayments,
    };
  }, [subscription]);

  return (
    <div className='w-full max-w-3xl flex flex-col gap-6'>
      <div className='flex flex-col items-center gap-4 w-full'>
        <div className='relative mt-2'>
          <div className={cn('size-6 rounded-full absolute top-0 end-0 ring-2 ring-background',
            {'bg-green-500': subscription.enabled},
            {'bg-red-500': !subscription.enabled}
          )} />
          <div className='size-24 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 shadow-sm'>
            <LogoIcon icon={parsedIcon} className='size-12'>
              <span className='text-3xl font-semibold'>{subscription.name[0].toUpperCase()}</span>
            </LogoIcon>
          </div>
        </div>

        <div className='flex flex-col gap-1 w-full'>
          <h1 className='text-3xl font-bold'>
            {subscription.name}
          </h1>
          <p className='text-lg wrap-break-word font-medium tabular-nums'>
            {formatPrice(subscription.price, subscription.currency, locale)}{' / '}{tCycle(subscription.cycle.time, { count: subscription.cycle.every })}
          </p>
        </div>

        {subscription.categories?.length > 0 && (
          <div className='flex flex-wrap gap-1 w-full justify-center'>
            {subscription.categories.map((category) => (
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

        <div className='flex flex-col sm:flex-row gap-4 gap-4 w-full max-w-sm items-center justify-center'>
          {subscription.url && (
            <Button className='w-full sm:w-auto max-w-xs sm:basis-sm' asChild>
              <Link href={subscription.url} target='_blank' rel='noopener noreferrer' title={t('buttons.linkTitle')}>
                <Icons.link />
                {t('buttons.link')}
              </Link>
            </Button>
          )}
          <Button variant='outline' className='w-full sm:w-auto max-w-xs sm:basis-sm' asChild>
            <Link href={`/edit/${subscription.id}`} title={t('buttons.editTitle')}>
              <Icons.edit />
              {tCommon('edit')}
            </Link>
          </Button>
        </div>
      </div>

      <Card className='text-left'>
        <CardHeader>
          <CardTitle>{t('overview.title')}</CardTitle>
          <CardDescription>{t('overview.description')}</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-3'>
          {!subscription.enabled && (
            <div className='flex items-center gap-2 p-4 rounded-lg border-s-4 border-s-red-500 bg-red-500/10'>
              <p className='text-sm'>
                {t('overview.disabled')}
              </p>
            </div>
          )}

          {subscription.enabled && (
            <>
              <div className={cn('flex items-center gap-2 p-4 rounded-lg border-s-4', {
                'border-s-red-500 bg-red-500/10': stats.unpaidPayments.count,
                'border-s-green-500 bg-green-500/10': !stats.unpaidPayments.count
              })}>
                <p className='text-sm'>
                  {stats.unpaidPayments.count ? (
                    t.rich('overview.unpaid.hasUnpaid', {
                      count: () => <span className='font-semibold'>{stats.unpaidPayments.count}</span>,
                      total: () => <span className='font-semibold tabular-nums'>{formatPrice(stats.unpaidPayments.total, subscription.currency, locale)}</span>
                    })
                  ) : (
                    t('overview.unpaid.allPaid')
                  )}
                </p>
              </div>

              <div className='flex items-center gap-2 px-4 py-2 rounded-lg border-s-4 border-s-muted-foreground'>
                <p className='text-sm'>
                  {stats.nextPaymentDate ? (
                    t.rich('overview.nextPayment.scheduled', {
                      price: () => <span className='font-semibold tabular-nums'>{formatPrice(subscription.price, subscription.currency, locale)}</span>,
                      date: () => <span className='font-semibold'>{formatter.dateTime(stats.nextPaymentDate, {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>,
                      distance: () => <span className='font-semibold'>{formatter.relativeTime(stats.nextPaymentDate, {now: new Date()})}</span>
                    })
                  ) : (
                    t('overview.nextPayment.none')
                  )}
                </p>
              </div>

              <div className='flex items-center gap-2 px-4 py-2 rounded-lg border-s-4 border-s-muted-foreground'>
                <p className='text-sm'>
                  {subscription?.untilDate ? (
                    t.rich('overview.endDate.hasEndDate', {
                      date: () => <span className='font-semibold'>{formatter.dateTime(subscription.untilDate, {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}</span>
                    })
                  ) : (
                    t('overview.endDate.ongoing')
                  )}
                </p>
              </div>

              <div className='flex items-center gap-2 px-4 py-2 rounded-lg border-s-4 border-s-muted-foreground'>
                <p className='text-sm'>
                  {subscription?.untilDate ? (
                    t.rich('overview.remainingPayments.withEndDate', {
                      count: () => <span className='font-semibold'>{stats.remainingPayments}</span>,
                      total: () => <span className='font-semibold tabular-nums'>{formatPrice(stats.remainingPayments * subscription.price, subscription.currency, locale)}</span>
                    })
                  ) : (
                    t.rich('overview.remainingPayments.thisYear', {
                      count: () => <span className='font-semibold'>{stats.payments.length}</span>,
                      total: () => <span className='font-semibold tabular-nums'>{formatPrice(stats.totalCost, subscription.currency, locale)}</span>
                    })
                  )}
                </p>
              </div>

              {(subscription?.paymentMethods?.length || 0) > 0 && (
                <div className='flex items-center gap-2 px-4 py-2 rounded-lg border-s-4 border-s-muted-foreground'>
                  <div className='block text-sm'>
                    {t.rich('overview.paymentMethods.text', {
                      methods: () => {
                        const methodElements = subscription?.paymentMethods.map((paymentMethod) => (
                          <span key={paymentMethod.name} className='inline-flex gap-1 align-bottom items-center'>
                            <LogoIcon icon={paymentMethod.icon ? JSON.parse(paymentMethod.icon) : false} className='size-4' />
                            <span className='font-semibold'>{paymentMethod.name}</span>
                          </span>
                        ));
                        return formatter.list(methodElements, { type: 'conjunction', style: 'long' });
                      }
                    })}
                  </div>
                </div>
              )}

              <div className='flex items-center gap-2 px-4 py-2 rounded-lg border-s-4 border-s-muted-foreground'>
                <p className='text-sm'>
                  {(subscription?.pastPayments?.totalCount || 0) > 0 ? (
                    <>
                      {t.rich('overview.pastPayments.hasPast', {
                        count: subscription.pastPayments.totalCount,
                        total: subscription.pastPayments.total.map(c => formatPrice(c.sum, c.currency, locale)).join(' + '),
                        // 3. Define the tag renderers for the style
                        countTag: (chunks) => <span className='font-semibold'>{chunks}</span>,
                        totalTag: (chunks) => <span className='font-semibold tabular-nums'>{chunks}</span>
                      })}
                      {(subscription.pastPayments.yearCount || 0) > 0 && (
                        t.rich('overview.pastPayments.yearStats', {
                          count: subscription.pastPayments.yearCount,
                          total: subscription.pastPayments.year.map(c => formatPrice(c.sum, c.currency, locale)).join(' + '),
                          // 3. Define the tag renderers for the style
                          countTag: (chunks) => <span className='font-semibold'>{chunks}</span>,
                          totalTag: (chunks) => <span className='font-semibold tabular-nums'>{chunks}</span>
                        })
                      )}
                    </>
                  ) : (
                    t('overview.pastPayments.none')
                  )}
                </p>
              </div>

              <div className='flex items-center gap-2 px-4 py-2 rounded-lg border-s-4 border-s-muted-foreground'>
                {subscription?.notifications?.length > 0 ? (
                  <div className='text-sm flex flex-col gap-1'>
                    {t('overview.notifications.title')}
                    {subscription.notifications.sort((a, b) => {
                        const timeOrder = { 'INSTANT': 0, 'MINUTES': 1, 'HOURS': 2, 'DAYS': 3, 'WEEKS': 4 };
                        return timeOrder[b.time] - timeOrder[a.time];
                      }).map((notification) => {
                        // Build list of notification methods
                        const notifyViaList = [
                          notification.type.includes('EMAIL') && t('overview.notifications.types.email'),
                          notification.type.includes('PUSH') && t('overview.notifications.types.push'),
                          notification.type.includes('WEBHOOK') && externalServices?.webhook?.enabled && t('overview.notifications.types.webhook'),
                          notification.type.includes('NTFY') && externalServices?.ntfy?.enabled && t('overview.notifications.types.ntfy'),
                          notification.type.includes('DISCORD') && externalServices?.discord?.enabled && t('overview.notifications.types.discord'),
                          notification.type.includes('SLACK') && externalServices?.slack?.enabled && t('overview.notifications.types.slack'),
                        ].filter(Boolean);

                        // Format timing text
                        const timing = notification.due === 0
                            ? t('overview.notifications.timing.instant')
                            : notification.time === 'MINUTES'
                              ? t('overview.notifications.timing.minutes', { count: notification.due })
                            : notification.time === 'HOURS'
                              ? t('overview.notifications.timing.hours', { count: notification.due })
                            : notification.time === 'DAYS'
                              ? t('overview.notifications.timing.days', { count: notification.due })
                            : t('overview.notifications.timing.weeks', { count: notification.due });

                        return (
                          <p key={`${notification.time}-${notification.due}`}>
                            {'• '}
                            {notifyViaList.length > 0 ? (
                              t.rich('overview.notifications.item', {
                                timing: () => <span className='font-semibold'>{timing}</span>,
                                channels: () => <span className='font-semibold'>{formatter.list(notifyViaList, { type: 'conjunction', style: 'long' })}</span>
                              })
                            ) : (
                              t.rich('overview.notifications.itemNoType', {
                                timing: () => <span className='font-semibold'>{timing}</span>,
                                error: (chunks) => <span className='text-red-500'>{chunks}</span>
                              })
                            )}
                          </p>
                        );
                      })}
                  </div>
                ) : (
                  <div className='text-sm'>
                    {t('overview.notifications.none')}
                  </div>
                )}
              </div>

              {subscription?.nextNotificationTime && (
                <div className='flex items-center gap-2 px-4 py-2 rounded-lg border-s-4 border-s-muted-foreground'>
                  <p className='text-sm'>
                    {t.rich('overview.nextNotification.text', {
                      date: () => <span className='font-semibold'>{formatter.dateTime(subscription.nextNotificationTime, {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}</span>,
                      distance: () => <span className='font-semibold'>{isPast(subscription.nextNotificationTime) ? t('overview.nextNotification.soon') : formatter.relativeTime(subscription.nextNotificationTime, {now: new Date()})}</span>,
                      channels: () => {
                        const translatedChannels = subscription.nextNotificationDetails.type
                          .filter(type => (type !== 'WEBHOOK' || externalServices?.webhook?.enabled) && (type !== 'NTFY' || externalServices?.ntfy?.enabled) && (type !== 'DISCORD' || externalServices?.discord?.enabled) && (type !== 'SLACK' || externalServices?.slack?.enabled))
                          .map((type) => (
                            <span key={type} className='font-semibold'>
                              {t(`overview.notifications.types.${type.toLowerCase()}`)}
                            </span>
                          ));
                        return formatter.list(translatedChannels, { type: 'conjunction', style: 'long' });
                      }
                    })}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card className='text-left'>
        <CardHeader>
          <CardTitle>{t('costBreakdown.title')}</CardTitle>
          <CardDescription>{t('costBreakdown.description')}</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-6'>
          <div className='flex flex-col gap-4'>
            {[
              { period: t('costBreakdown.periods.30days'), cost: stats.monthlyCost },
              { period: t('costBreakdown.periods.3months'), cost: stats.quarterlyCost },
              { period: t('costBreakdown.periods.12months'), cost: stats.yearlyCost }
            ].map(({ period, cost }) => (
              <div key={period} className='flex items-center justify-between'>
                <div className='flex items-center gap-2 sm:gap-3'>
                  <div className='flex items-center justify-center'>
                    <Icons.calendar className='size-4 sm:size-5 text-primary' />
                  </div>
                  <span className='text-sm font-medium'>{period}</span>
                </div>
                <span className='text-lg font-semibold tabular-nums'>
                  {formatPrice(cost, subscription.currency, locale)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {subscription?.notes && (
        <Card className='text-left'>
          <CardHeader>
            <CardTitle>{t('notes.title')}</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-wrap gap-2 whitespace-pre-wrap text-sm'>
            {subscription.notes}
          </CardContent>
        </Card>
      )}

      <Card className='text-left'>
        <CardHeader>
          <CardTitle>{t('paymentSchedule.title')}</CardTitle>
          <CardDescription>{t('paymentSchedule.description')}</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-2'>
          <div className='divide-y divide-border'>
            {stats.payments.length === 0 ? (
              <p className='text-muted-foreground'>{t('paymentSchedule.noUpcoming')}</p>
            ) : (
              stats.payments.slice(0, maxUpcomingPayments).map((payment, index) => (
                <div
                  key={index}
                  className='flex flex-row items-start sm:items-center sm:justify-between gap-2 p-2 text-sm transition-colors hover:bg-muted/50 hover:rounded-lg'
                >
                  <div className={cn(
                    'size-2 rounded-full shrink-0 mt-1.5 sm:mt-0',
                    isPast(payment.date) ? 'bg-red-500' :
                    stats.nextPaymentDate && isEqual(payment.date, stats.nextPaymentDate) ? 'bg-green-500' :
                    'bg-orange-400 dark:bg-orange-500'
                  )}></div>
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between w-full'>
                    <span className='truncate'>
                      {formatter.dateTime(payment.date, {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                    <span className='font-medium tabular-nums break-all'>
                      {formatPrice(payment.price, subscription.currency, locale)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          {stats.payments.length > maxUpcomingPayments && (
            <div className='text-center text-sm text-muted-foreground'>
              {t('paymentSchedule.more', { count: stats.payments.length - maxUpcomingPayments })}
            </div>
          )}
        </CardContent>
        <CardFooter className='flex flex-col sm:flex-row items-start sm:items-center justify-between border-t pt-4 text-left'>
          <div className='flex items-center gap-1 text-base font-medium'>
            <span className='text-sm text-muted-foreground'>{t('paymentSchedule.totalPayments')}</span>
            <span>{stats.payments.length}</span>
          </div>
          <div className='flex items-center gap-1 text-base font-medium'>
            <span className='text-sm text-muted-foreground'>{t('paymentSchedule.total')}</span>
            <span className='tabular-nums'>{formatPrice(stats.totalCost, subscription.currency, locale)}</span>
          </div>
        </CardFooter>
      </Card>

      <Card className='text-left'>
        <CardHeader>
          <CardTitle>{t('latestPayments.title')}</CardTitle>
          <CardDescription>{t('latestPayments.description')}</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-2'>
          <div className='divide-y divide-border'>
            {(!subscription?.pastPayments?.lastPayments || subscription.pastPayments.lastPayments.length === 0) ? (
              <p className='text-muted-foreground'>{t('latestPayments.none')}</p>
            ) : (
              subscription.pastPayments.lastPayments.map((payment, index) => {
                const getStatus = (paidAt, paymentDate) => {
                  const onTime = {
                    status: 0,
                    label: t('latestPayments.status.onTime'),
                  };
                  const acceptableMinutes = 15;

                  if (!paidAt || !paymentDate) {
                    return onTime;
                  }

                  // gives the difference of paidAt - paymentDate
                  const diff = differenceInMinutes(paidAt, paymentDate);

                  if (Math.abs(diff) <= acceptableMinutes) {
                    return onTime;
                  }

                  if (diff > 0) {
                    return {
                      status: 1,
                      label: t('latestPayments.status.late', { distance: formatDistanceStrict(paidAt, paymentDate) }),
                    };
                  }

                  return {
                    status: -1,
                    label: t('latestPayments.status.early', { distance: formatDistanceStrict(paidAt, paymentDate) }),
                  };
                };

                const paidAtZoned = toZonedTime(payment.paidAt, subscription.timezone);
                const paymentDateZoned = payment.paymentDate ? toZonedTime(payment.paymentDate, subscription.timezone) : null;
                const status = getStatus(payment.paidAt, payment.paymentDate);
                return (
                  <div key={index} className='flex flex-row items-start sm:items-center sm:justify-between gap-2 p-2 text-sm transition-colors hover:bg-muted/50 hover:rounded-lg'>
                    <div className={cn(
                      'size-2 rounded-full shrink-0 mt-1.5 sm:mt-0',
                      status.status === 1 ? 'bg-orange-400 dark:bg-orange-500' : 'bg-green-500'
                    )}></div>
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between w-full'>
                      <Popover>
                        <PopoverTrigger asChild>
                          <span className='truncate cursor-pointer'>
                            {formatter.dateTime(paidAtZoned, {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </PopoverTrigger>
                        <PopoverContent className='bg-foreground text-background text-sm w-auto max-w-xl wrap-break-word px-4 py-2 leading-6'>
                          <div>
                            {t.rich('latestPayments.popover.paidStatus', {
                              status: () => <span className='font-semibold'>{status.label}</span>
                            })}
                          </div>
                          <div>
                            <span className='font-semibold'>{t('latestPayments.popover.scheduled')}</span><br/>
                            {formatter.dateTime(paymentDateZoned, {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          <div>
                            <span className='font-semibold'>{t('latestPayments.popover.actual')}</span><br/>
                            {formatter.dateTime(payment.paidAt, {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </PopoverContent>
                      </Popover>
                      <span className='font-medium tabular-nums break-all'>
                        {formatPrice(payment.price, payment.currency, locale)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {subscription?.pastPayments?.totalCount > subscription?.pastPayments?.lastPayments?.length && (
            <div className='text-center text-sm text-muted-foreground'>
              {t('paymentSchedule.more', { count: subscription?.pastPayments?.totalCount - subscription?.pastPayments?.lastPayments?.length })}
            </div>
          )}
        </CardContent>
        <CardFooter className='flex flex-col sm:flex-row items-start sm:items-center justify-between border-t pt-4 text-left'>
          <div className='flex items-center gap-1 text-base font-medium'>
            <span className='text-sm text-muted-foreground'>{t('paymentSchedule.totalPayments')}</span>
            <span>{subscription?.pastPayments?.totalCount || 0}</span>
          </div>
          <div className='flex items-center gap-1 text-base font-medium'>
            <span className='text-sm text-muted-foreground'>{t('paymentSchedule.total')}</span>
            <span className='tabular-nums'>
              {subscription.pastPayments.total.map(c => `${formatPrice(c.sum, c.currency, locale)}`).join(' + ')}
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}