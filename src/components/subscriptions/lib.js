import { addDays, addWeeks, addMonths, addYears, subMinutes, subHours, subDays, subWeeks, isPast, isBefore, isAfter } from 'date-fns';

// This function assumes subscription is enabled
export const GetNextPaymentDate = (currentPaymentDate, untilDate, time, every) => {
  if (time === 'DAYS') {
    currentPaymentDate = addDays(currentPaymentDate, every);
  } else if (time === 'WEEKS') {
    currentPaymentDate = addWeeks(currentPaymentDate, every);
  } else if (time === 'MONTHS') {
    currentPaymentDate = addMonths(currentPaymentDate, every);
  } else if (time === 'YEARS') {
    currentPaymentDate = addYears(currentPaymentDate, every);
  }

  return (untilDate && currentPaymentDate > untilDate) ? null : currentPaymentDate;
}

const GetNotificationDates = (paymentDate, notifications) => {
  return notifications.map(notification => {
    let date;
    switch(notification.time) {
      case 'INSTANT':
        date = paymentDate;
        break;
      case 'MINUTES':
        date = subMinutes(paymentDate, notification.due);
        break;
      case 'HOURS':
        date = subHours(paymentDate, notification.due);
        break;
      case 'DAYS':
        date = subDays(paymentDate, notification.due);
        break;
      case 'WEEKS':
        date = subWeeks(paymentDate, notification.due);
        break;
      default:
        date = null;
        break;
    }

    return date ? {
      date: date,
      details: {
        paymentDate: paymentDate,
        type: notification.type,
      }
    } : null;
  })
  .filter(Boolean)
  // Filter out past dates
  .filter(item => !isPast(item.date))
  // Sort ascending
  .sort((a, b) => a.date - b.date);
}

export const SubscriptionGetNextPaymentDate = (subscription) => {
  if (!subscription.enabled) {
    return null;
  }

  return GetNextPaymentDate(subscription.paymentDate, subscription.untilDate, subscription.cycle.time, subscription.cycle.every);
}

export const SubscriptionGetNextFuturePaymentDate = (subscription) => {
  if (!subscription.enabled) {
    return null;
  }

  let every = subscription.cycle.every;
  let nextPaymentDate = (subscription.untilDate && isAfter(subscription.paymentDate, subscription.untilDate)) ? null : subscription.paymentDate;
  while (nextPaymentDate && isPast(nextPaymentDate)) {
    nextPaymentDate = GetNextPaymentDate(subscription.paymentDate, subscription.untilDate, subscription.cycle.time, every);
    every += subscription.cycle.every;
  }

  return nextPaymentDate;
};

export const SubscriptionGetUpcomingPayments = (subscription, endDate) => {
  if (!subscription.enabled) {
    return null;
  }

  const payments = [];
  let currentDate = (subscription.untilDate && isAfter(subscription.paymentDate, subscription.untilDate)) ? null : subscription.paymentDate;
  let every = subscription.cycle.every;

  // Add all future payments until end of next year
  while (currentDate && !isAfter(currentDate, endDate)) {
    payments.push({
      price: subscription.price,
      currency: subscription.currency,
      date: currentDate,
    });
    currentDate = GetNextPaymentDate(subscription.paymentDate, subscription.untilDate, subscription.cycle.time, every);
    every += subscription.cycle.every;
  }

  return payments;
}

export const SubscriptionGetNextNotificationDate = (subscription) => {
  if (!subscription.enabled) {
    return null;
  }

  const notifications = subscription.notifications || [];
  if (notifications.length === 0) {
    return null;
  }

  const paymentDate = SubscriptionGetNextFuturePaymentDate(subscription);
  if (!paymentDate) {
    return null;
  }

  // Calculate all notification dates for current payment
  const notificationDates = GetNotificationDates(paymentDate, notifications);

  if (notificationDates.length !== 0) {
    return {
      date: notificationDates[0].date,
      details: notificationDates[0].details
    };
  }

  const nextPaymentDate = GetNextPaymentDate(paymentDate, subscription.untilDate, subscription.cycle.time, subscription.cycle.every);
  if (!nextPaymentDate) {
    return null;
  }

  const nextNotificationDates = GetNotificationDates(nextPaymentDate, notifications);
  return nextNotificationDates.length > 0 ? {
    date: nextNotificationDates[0].date,
    details: nextNotificationDates[0].details
  } : null;
};
