'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { format, addMonths, differenceInDays, addYears, isBefore, isPast, formatDistanceToNowStrict, isEqual } from 'date-fns';
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
import { SubscriptionGetUpcomingPayments, SubscriptionGetNextFuturePaymentDate } from '@/components/subscriptions/lib';
import { getCycleLabel, getPaymentCount, formatPrice } from '@/components/subscriptions/utils';
import { cn } from '@/lib/utils';

export function SubscriptionView({ user, subscription }) {
  const parsedIcon = subscription.logo ? JSON.parse(subscription.logo) : false;
  const maxUpcomingPayments = 16;

  // Calculate statistics
  const stats = useMemo(() => {
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
      pastPayments: payments.reduce(
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
          <div className={cn('size-6 rounded-full absolute -top-0 -right-0 ring-2 ring-background',
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
          <p className='text-lg break-words font-medium tabular-nums'>
            {formatPrice(subscription.price, subscription.currency)}{' / '}{getCycleLabel(subscription.cycle)}
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
              <Link href={subscription.url} target='_blank' rel='noopener noreferrer' title='Subscription Link'>
                <Icons.link />
              Link
            </Link>
          </Button>
          )}
          <Button variant='outline' className='w-full sm:w-auto max-w-xs sm:basis-sm' asChild>
            <Link href={`/edit/${subscription.id}`} title='Edit Subscription'>
              <Icons.edit />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <Card className='text-left'>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>Key metrics for this subscription</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-3'>
          <div className={cn('flex items-center gap-2 p-4 rounded-lg border-l-4', {
            'border-l-red-500 bg-red-500/10': stats.pastPayments.count,
            'border-l-green-500 bg-green-500/10': !stats.pastPayments.count
          })}>
            <p className='text-sm'>
              {stats.pastPayments.count ? (
                <>
                  Oh no! You have <span className='font-semibold'>{stats.pastPayments.count}</span> past payment{stats.pastPayments.count > 1 ? 's' : ''} for this subscription totaling <span className='font-semibold tabular-nums'>{formatPrice(stats.pastPayments.total, subscription.currency)}</span>.
                </>
              ) : (
                'Good job! This subscription is fully paid up to date.'
              )}
            </p>
          </div>

          <div className='flex items-center gap-2 px-4 py-2 rounded-lg border-l-4 border-l-muted-foreground'>
            <p className='text-sm'>
              {stats.nextPaymentDate ? (
                <>
                  Your next payment of{' '}
                  <span className='font-semibold tabular-nums'>
                    {formatPrice(subscription.price, subscription.currency)}
                  </span>
                  {' '}
                  is due on
                  {' '}
                  <span className='font-semibold'>
                    {format(stats.nextPaymentDate, 'dd MMMM yyyy, HH:mm')}
                  </span>
                  {' which is '}
                  <span className='font-semibold'>
                    {formatDistanceToNowStrict(stats.nextPaymentDate, {addSuffix: true})}
                  </span>
                  {'.'}
                </>
              ) : (
                'Congrats! There are no future payments scheduled for this subscription.'
              )}
            </p>
          </div>

          <div className='flex items-center gap-2 px-4 py-2 rounded-lg border-l-4 border-l-muted-foreground'>
            <p className='text-sm'>
              {subscription?.untilDate ? (
                <>
                  This subscription will end on{' '}
                  <span className='font-semibold'>
                    {format(subscription.untilDate, 'dd MMMM yyyy')}
                  </span>
                  .
                </>
              ) : (
                'This is an ongoing subscription with no specified end date.'
              )}
            </p>
          </div>

          <div className='flex items-center gap-2 px-4 py-2 rounded-lg border-l-4 border-l-muted-foreground'>
            <p className='text-sm'>
              {subscription?.untilDate ? (
                <>
                  This subscription will require{' '}
                  <span className='font-semibold'>
                    {stats.remainingPayments} payment{stats.remainingPayments !== 1 ? 's' : ''}
                  </span>
                  {' totaling '}
                  <span className='font-semibold tabular-nums'>
                    {formatPrice(stats.remainingPayments * subscription.price, subscription.currency)}
                  </span>
                  {'.'}
                </>
              ) : (
                <>
                  This subscription will require{' '}
                  <span className='font-semibold'>
                    {stats.payments.length} payment{stats.payments.length !== 1 ? 's' : ''}
                  </span>
                  {' this year, totaling '}
                  <span className='font-semibold tabular-nums'>
                    {formatPrice(stats.totalCost, subscription.currency)}
                  </span>
                  {'.'}
                </>
              )}
            </p>
          </div>

          <div className='flex items-center gap-2 px-4 py-2 rounded-lg border-l-4 border-l-muted-foreground'>
            {subscription?.notifications?.length > 0 ? (
              <div className='text-sm flex flex-col gap-1'>
                You will receive notifications:
                {subscription.notifications.sort((a, b) => {
                  const timeOrder = { 'INSTANT': 0, 'MINUTES': 1, 'HOURS': 2, 'DAYS': 3, 'WEEKS': 4 };
                  return timeOrder[b.time] - timeOrder[a.time];
                }).map((notification, index) => {
                  const notifyVia = notification.type.map(t => t === 'EMAIL' ? 'email' : 'push notification').join(' and ');
                  const timing = notification.due === 0
                    ? 'At the payment date'
                    : notification.time === 'MINUTES'
                      ? `${notification.due} minute${notification.due > 1 ? 's' : ''} before payment`
                    : notification.time === 'HOURS'
                      ? `${notification.due} hour${notification.due > 1 ? 's' : ''} before payment`
                    : notification.time === 'DAYS'
                      ? `${notification.due} day${notification.due > 1 ? 's' : ''} before payment`
                    : `${notification.due} week${notification.due > 1 ? 's' : ''} before payment`;

                  return (
                    <p key={`${notification.time}-${notification.due}`}>
                      {'• '}
                      <span className='font-semibold'>{timing}</span>
                      {' via '}
                      <span className='font-semibold'>{notifyVia}</span>
                      {'.'}
                    </p>
                  );
                })}
              </div>
            ) : (
              <div className='text-sm'>
                No notifications are set up for this subscription.
              </div>
            )}
          </div>

          {subscription?.nextNotificationTime && (
            <div className='flex items-center gap-2 px-4 py-2 rounded-lg border-l-4 border-l-muted-foreground'>
              <p className='text-sm'>
                  <>
                    Next notification will be on
                    {' '}
                    <span className='font-semibold'>
                      {format(subscription.nextNotificationTime, 'dd MMMM yyyy')}
                    </span>
                    {' which is '}
                    <span className='font-semibold'>
                      {isPast(subscription.nextNotificationTime) ? 'soon' : formatDistanceToNowStrict(subscription.nextNotificationTime, {addSuffix: true})}
                    </span>
                    {' via '}
                    {subscription.nextNotificationDetails.type.map((type, index) => (
                      <span key={type}>
                        {index > 0 && ' and '}
                        <span className='font-semibold'>
                          {type === 'EMAIL' ? 'email' : 'push notification'}
                        </span>
                      </span>
                    ))}
                    {'.'}
                  </>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className='text-left'>
        <CardHeader>
          <CardTitle>Cost Breakdown</CardTitle>
          <CardDescription>Future spending for this subscription</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-6'>
          <div className='flex flex-col gap-4'>
            {[
              { period: '30 days', cost: stats.monthlyCost },
              { period: '3 months', cost: stats.quarterlyCost },
              { period: '12 months', cost: stats.yearlyCost }
            ].map(({ period, cost }) => (
              <div key={period} className='flex items-center justify-between'>
                <div className='flex items-center gap-2 sm:gap-3'>
                  <div className='flex items-center justify-center'>
                    <Icons.calendar className='size-4 sm:size-5 text-primary' />
                  </div>
                  <span className='text-sm font-medium'>Next {period}</span>
                </div>
                <span className='text-lg font-semibold tabular-nums'>
                  {formatPrice(cost, subscription.currency)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {subscription?.notes && (
        <Card className='text-left'>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-wrap gap-2 whitespace-pre-wrap text-sm'>
            {subscription.notes}
          </CardContent>
        </Card>
      )}

      <Card className='text-left'>
        <CardHeader>
          <CardTitle>Payment Schedule</CardTitle>
          <CardDescription>Upcoming payment dates in a year</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-2'>
          <div className='divide-y divide-border'>
            {stats.payments.length === 0 ? (
              <p className='text-muted-foreground'>No upcoming payments</p>
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
                      {format(payment.date, 'dd MMMM yyyy')}
                    </span>
                    <span className='font-medium tabular-nums break-all'>
                      {formatPrice(payment.price, subscription.currency)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          {stats.payments.length > maxUpcomingPayments && (
            <div className='text-center text-sm text-muted-foreground'>
              + {stats.payments.length - maxUpcomingPayments} more
            </div>
          )}
        </CardContent>
        <CardFooter className='flex flex-col sm:flex-row items-start sm:items-center justify-between border-t pt-4 text-left'>
          <div className='flex items-center gap-1 text-base font-medium'>
            <span className='text-sm text-muted-foreground'>Total payments:</span>
            <span>{stats.payments.length}</span>
          </div>
          <div className='flex items-center gap-1 text-base font-medium'>
            <span className='text-sm text-muted-foreground'>Total:</span>
            <span className='tabular-nums'>{formatPrice(stats.totalCost, subscription.currency)}</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}