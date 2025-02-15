'use client';

import { useMemo, Fragment } from 'react';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { addMonths, addYears, startOfMonth, startOfYear, endOfMonth, endOfYear } from 'date-fns';
import { DefaultCurrencies } from '@/config/currencies';
import { GetNextPaymentDate } from '@/components/subscriptions/lib';
import { Icons } from '@/components/icons';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { LogoIcon } from '@/components/ui/icon-picker';
import { Divider } from '@/components/ui/divider';

const formatPrice = (price, currency) => {
  return currency.position === 'before'
    ? `${currency.symbol}${price.toFixed(2)}`
    : `${price.toFixed(2)}${currency.symbol}`;
};

const PricePrinter = ({ cost, isPlus }) => {
  return (
    <>
      <span className='tabular-nums'>{cost}</span>
      {isPlus && <span className='text-xs text-muted-foreground'> + </span>}
    </>
  );
};

const OverviewRow = ({ title, description, costs = {total: {}}, categories }) => {
  return (
    <Collapsible className='flex flex-col gap-2' disabled={Object.entries(costs?.categories || {}).length === 0}>
      <CollapsibleTrigger className={cn('flex items-center gap-2 w-full p-2', {
        'hover:bg-muted/50 rounded-lg transition-colors': Object.entries(costs?.categories || {}).length > 0
      })}>
        <div className='flex flex-col gap-1 grow text-left'>
          <span className='text-sm font-medium'>{title}</span>
          <span className='text-xs text-muted-foreground'>{description}</span>
        </div>
        <div className='shrink-0'>
          <div className='flex flex-col gap-0 font-semibold text-right'>
            {Object.entries(costs?.total || {}).length === 0 ? (
              <span>-</span>
            ) : (
              Object.entries(costs.total).map(([currency, cost], index) => (
                <PricePrinter
                  key={`${title}-${currency}`}
                  cost={formatPrice(cost, DefaultCurrencies[currency])}
                  isPlus={index < Object.entries(costs.total).length - 1}
                />
              ))
            )}
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className='flex flex-col divide-y divide-border'>
          {Object.entries(costs?.categories || {}).sort().map(([category, currencies]) => (
            <div
              key={category}
              className='flex flex-row items-start sm:items-center gap-2 p-2 text-xs hover:bg-muted/50'
            >
              <div
                className='size-3 rounded-full shrink-0 mt-1 sm:mt-0'
                style={{ backgroundColor: categories[category]?.color }}
                aria-hidden='true'
              />

              <div className='flex grow sm:flex-row sm:items-center sm:justify-between flex-col gap-1 overflow-hidden'>
                <div className='text-sm overflow-hidden text-ellipsis'>
                  {category}
                </div>

                <div className='text-sm text-muted-foreground sm:text-foreground text-left sm:text-right'>
                  {Object.entries(currencies).map(([curr, amt], idx, arr) => (
                    <Fragment key={curr}>
                      <span className='tabular-nums'>
                        {formatPrice(amt, DefaultCurrencies[curr])}
                      </span>
                      {idx < arr.length - 1 && (
                        <span className='text-muted-foreground'> + </span>
                      )}
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

const MostExpensiveSubscription = ({ title, mostExpensive }) => {
  return (
    <div className='flex flex-col gap-2 p-2'>
      <div className='text-sm font-medium'>{title}</div>
      <div className='flex flex-col gap-2'>
        {Object.values(mostExpensive || {}).length === 0 ? (
          <div className='text-sm text-muted-foreground'>
            No subscriptions.
          </div>
        ) : Object.entries(mostExpensive || {}).map(([currency, data]) => (
          <div
            key={`expensive-${currency}-${data.name}-${data.amount}`}
            className='flex flex-row items-start sm:items-center gap-2 p-2 text-xs transition-colors hover:bg-muted/50 hover:rounded-lg'
          >
            <div className='flex items-center justify-center shrink-0 size-11 rounded-full bg-gray-200 dark:bg-gray-800'>
              <LogoIcon icon={data.logo} className='size-6'>
                <span className='text-base font-medium'>{data.name[0].toUpperCase()}</span>
              </LogoIcon>
            </div>
            <div className='flex grow sm:flex-row sm:items-center sm:justify-between flex-col gap-1 overflow-hidden'>
              <div className='text-sm font-medium overflow-hidden text-ellipsis'>
                {data.name}
              </div>
              <div className='text-sm text-muted-foreground sm:text-foreground font-medium shrink-0 overflow-hidden text-ellipsis tabular-nums'>
                {formatPrice(data.amount, DefaultCurrencies[currency])}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const UpcomingPayments = ({ upcoming }) => {
  const hasThisMonth = upcoming?.thisMonth && Object.values(upcoming.thisMonth).length > 0;
  const hasNextMonth = upcoming?.nextMonth && Object.values(upcoming.nextMonth).length > 0;

  if (!hasThisMonth && !hasNextMonth) {
    return (
      <div className='text-sm text-muted-foreground'>
        No upcoming payments in one month.
      </div>
    );
  }

  const renderPayments = (payments) => {
    return Object.values(payments).map((upcomingPayments) =>
      Object.entries(upcomingPayments).map(([currency, payments]) =>
        payments.map((payment) => (
          <div
            key={`upcoming-${payment.name}-${payment.amount}-${payment.date.getTime()}`}
            className='flex flex-row items-start sm:items-center gap-2 p-2 transition-colors hover:bg-muted/50 hover:rounded-lg'
          >
            <div className='flex items-center justify-center shrink-0 size-11 rounded-full bg-gray-200 dark:bg-gray-800'>
              <LogoIcon icon={payment.logo} className='size-6'>
                <span className='text-base font-medium'>{payment.name[0].toUpperCase()}</span>
              </LogoIcon>
            </div>
            <div className='flex grow sm:flex-row sm:items-center sm:justify-between flex-col gap-1 overflow-hidden'>
              <div className='flex flex-col gap-0.5 overflow-hidden'>
                <div className='text-sm font-medium break-words overflow-hidden text-ellipsis'>
                  {payment.name}
                </div>
                <div className='block sm:hidden text-sm font-medium shrink-0 tabular-nums overflow-hidden text-ellipsis tabular-nums'>
                  {formatPrice(payment.amount, DefaultCurrencies[currency])}
                </div>
                <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                  <Icons.calendar className='size-3.5 hidden sm:inline' />
                  <span className='overflow-hidden text-ellipsis'>{format(payment.date, 'dd MMMM yyyy, HH:mm')}</span>
                </div>
              </div>
              <div className='hidden sm:block text-sm font-medium shrink-0 tabular-nums overflow-hidden text-ellipsis tabular-nums'>
                {formatPrice(payment.amount, DefaultCurrencies[currency])}
              </div>
            </div>
          </div>
        ))
      )
    );
  };

  return (
    <div className='flex flex-col gap-2'>
      {hasThisMonth && renderPayments(upcoming.thisMonth)}
      {hasThisMonth && hasNextMonth && <Divider text='Next Month' />}
      {hasNextMonth && renderPayments(upcoming.nextMonth)}
    </div>
  );
};

export function SubscriptionReports({ subscriptions }) {
  const stats = useMemo(() => {
    const activeSubscriptions = subscriptions.filter(sub => sub.enabled);
    const inactiveSubscriptions = subscriptions.filter(sub => !sub.enabled);

    const now = new Date();
    const beginningOfNextMonth = startOfMonth(addMonths(now, 1));
    const endOfNextMonth = endOfMonth(addMonths(now, 1));
    const nextMonth = addMonths(now, 1);
    const beginningOfNextYear = startOfYear(addYears(now, 1));
    const endOfNextYear = endOfYear(addYears(now, 1));
    const nextYear = addYears(now, 1);

    const calculateUpcomingPayments = (sub) => {
      const payments = [];
      let currentDate = (sub.untilDate && sub.paymentDate > sub.untilDate) ? null : sub.paymentDate;

      // Add all future payments until end of next year
      while (currentDate && currentDate <= endOfNextYear) {
        if (currentDate >= now) {
          payments.push({
            price: sub.price,
            currency: sub.currency,
            date: currentDate,
          });
        }
        currentDate = GetNextPaymentDate(currentDate, sub.untilDate, sub.cycle.time, sub.cycle.every);
      }

      return payments;
    };

    // Group by currency for costs
    const costs = activeSubscriptions.reduce((acc, sub) => {
      if (!sub.enabled) {
        return acc;
      }

      const upcomingPayments = calculateUpcomingPayments(sub);
      const logo = sub.logo ? JSON.parse(sub.logo) : null;

      // Initialize period objects if they don't exist
      ['thisMonth', 'inOneMonth', 'nextMonth', 'thisYear', 'inOneYear', 'nextYear'].forEach(period => {
        if (!acc[period]) {
          acc[period] = { total: {}, categories: {} };
        }
      });

      if (!acc.mostExpensive) {
        acc.mostExpensive = { monthly: {}, yearly: {} };
      }

      if (!acc.inOneMonth.payments) {
        acc.inOneMonth.payments = {
          thisMonth: {},
          nextMonth: {}
        };
      }

      // Filter payments for different periods
      const periods = {
        thisMonth: [now, beginningOfNextMonth],
        inOneMonth: [now, nextMonth],
        nextMonth: [beginningOfNextMonth, endOfNextMonth],
        thisYear: [now, beginningOfNextYear],
        inOneYear: [now, nextYear],
        nextYear: [beginningOfNextYear, endOfNextYear]
      };

      const periodAmounts = {};
      Object.entries(periods).forEach(([period, [start, end]]) => {
        const payments = upcomingPayments.filter(p => p.date >= start && p.date <= end);
        periodAmounts[period] = payments.reduce((sum, p) => sum + p.price, 0);
      });

      // Track payments for this month and next month
      upcomingPayments
        .filter(p => p.date >= now && p.date <= nextMonth)
        .forEach(payment => {
          const dateStr = payment.date.toISOString().split('T')[0];
          const isThisMonth = payment.date < beginningOfNextMonth;
          const monthKey = isThisMonth ? 'thisMonth' : 'nextMonth';

          if (!acc.inOneMonth.payments[monthKey][dateStr]) {
            acc.inOneMonth.payments[monthKey][dateStr] = {};
          }
          if (!acc.inOneMonth.payments[monthKey][dateStr][sub.currency]) {
            acc.inOneMonth.payments[monthKey][dateStr][sub.currency] = [];
          }
          acc.inOneMonth.payments[monthKey][dateStr][sub.currency].push({
            name: sub.name,
            amount: payment.price,
            date: toZonedTime(payment.date, sub.timezone),
            logo: logo
          });
        });

      // Update most expensive subscriptions
      if (periodAmounts.inOneMonth > 0) {
        if (!acc.mostExpensive.monthly[sub.currency] ||
            periodAmounts.inOneMonth > acc.mostExpensive.monthly[sub.currency].amount) {
          acc.mostExpensive.monthly[sub.currency] = {
            name: sub.name,
            amount: periodAmounts.inOneMonth,
            logo: logo
          };
        }
      }

      if (periodAmounts.inOneYear > 0) {
        if (!acc.mostExpensive.yearly[sub.currency] ||
            periodAmounts.inOneYear > acc.mostExpensive.yearly[sub.currency].amount) {
          acc.mostExpensive.yearly[sub.currency] = {
            name: sub.name,
            amount: periodAmounts.inOneYear,
            logo: logo
          };
        }
      }

      // Update costs for each period
      Object.entries(periodAmounts).forEach(([period, amount]) => {
        if (amount === 0) return;

        if (!acc[period].total[sub.currency]) {
          acc[period].total[sub.currency] = 0;
        }
        acc[period].total[sub.currency] += amount;

        const categories = sub.categories.length > 0 ? sub.categories : [{ name: 'Uncategorized' }];
        categories.forEach(category => {
          if (!acc[period].categories[category.name]) {
            acc[period].categories[category.name] = {};
          }
          acc[period].categories[category.name][sub.currency] =
            (acc[period].categories[category.name][sub.currency] || 0) + amount;
        });
      });

      return acc;
    }, {});

    const categories = activeSubscriptions.reduce((acc, sub) => {
      const categoriesToAdd = sub.categories.length > 0 ? sub.categories : [{ name: 'Uncategorized' }];
      categoriesToAdd.forEach(category => {
        if (!acc[category.name]) {
          acc[category.name] = category;
        }
      });
      return acc;
    }, {});

    return {
      total: subscriptions.length,
      active: activeSubscriptions.length,
      inactive: inactiveSubscriptions.length,
      costs,
      categories
    };
  }, [subscriptions]);

  return (
    <div className='flex flex-col gap-4 w-full items-center text-left'>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col items-start gap-2'>
          <div className='flex flex-row gap-2 items-center'>
            <div className='size-3 rounded-full bg-blue-500'></div>
            <div className='text-lg font-semibold'>{stats.total}</div>
            <div className='text-sm font-medium'>total subscriptions</div>
          </div>
          <div className='flex flex-row gap-2 items-center'>
            <div className='size-3 rounded-full bg-green-500'></div>
            <div className='text-lg font-semibold'>{stats.active}</div>
            <div className='text-sm font-medium'>active subscriptions</div>
          </div>
          <div className='flex flex-row gap-2 items-center'>
            <div className='size-3 rounded-full bg-red-500'></div>
            <div className='text-lg font-semibold'>{stats.inactive}</div>
            <div className='text-sm font-medium'>inactive subscriptions</div>
          </div>
        </CardContent>
      </Card>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Cost Averages</CardTitle>
          <CardDescription>Monthly and yearly subscription cost averages</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          <div className='flex flex-col justify-between gap-2 text-sm'>
            <div className='whitespace-nowrap font-medium'>Monthly Average</div>
            <div className='flex flex-wrap items-center gap-1'>
              {Object.entries(stats.costs.inOneYear?.total || {}).map(([currency, cost], index) => (
                <PricePrinter
                  key={`monthly-avg-${currency}`}
                  cost={formatPrice(cost / 12, DefaultCurrencies[currency])}
                  isPlus={index < Object.entries(stats.costs.inOneYear.total).length - 1}
                />
              ))}
            </div>
          </div>
          <div className='flex flex-col justify-between gap-2 text-sm'>
            <div className='whitespace-nowrap font-medium'>Yearly Average</div>
            <div className='flex flex-wrap items-center gap-1'>
              {Object.entries(stats.costs.inOneYear?.total || {}).map(([currency, cost], index) => (
                <PricePrinter
                  key={`yearly-avg-${currency}`}
                  cost={formatPrice(cost, DefaultCurrencies[currency])}
                  isPlus={index < Object.entries(stats.costs.inOneYear.total).length - 1}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Monthly Cost Overview</CardTitle>
          <CardDescription>Track your monthly subscription costs</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-2'>
          <OverviewRow title='This Month' description='Until end of month' costs={stats.costs.thisMonth} categories={stats.categories} />
          <Separator />
          <OverviewRow title='Next Month' description='Upcoming month only' costs={stats.costs.nextMonth} categories={stats.categories} />
          <Separator />
          <OverviewRow title='Next 30 Days' description='Rolling period' costs={stats.costs.inOneMonth} categories={stats.categories} />
          <Separator />
          <MostExpensiveSubscription title='Most Expensive Monthly Subscription' mostExpensive={stats.costs.mostExpensive?.monthly} />
        </CardContent>
      </Card>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Yearly Cost Overview</CardTitle>
          <CardDescription>Track your yearly subscription costs</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-2'>
          <OverviewRow title='This Year' description='Until end of year' costs={stats.costs.thisYear} categories={stats.categories} />
          <Separator />
          <OverviewRow title='Next Year' description='Next calendar year' costs={stats.costs.nextYear} categories={stats.categories} />
          <Separator />
          <OverviewRow title='Next 365 Days' description='Rolling period' costs={stats.costs.inOneYear} categories={stats.categories} />
          <Separator />
          <MostExpensiveSubscription title='Most Expensive Yearly Subscription' mostExpensive={stats.costs.mostExpensive?.yearly} />
        </CardContent>
      </Card>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Upcoming Payments</CardTitle>
          <CardDescription>Track your upcoming payments</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-2'>
          <UpcomingPayments upcoming={stats.costs.inOneMonth?.payments} />
        </CardContent>
      </Card>
    </div>
  );
}