import { DefaultCurrencies } from '@/config/currencies';
import { differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears } from 'date-fns';

export const formatPrice = (price, currencySymbol) => {
  const currency = DefaultCurrencies[currencySymbol] || DefaultCurrencies.EUR;
  return currency.position === 'before'
    ? `${currency.symbol}${price.toFixed(2)}`
    : `${price.toFixed(2)}${currency.symbol}`;
};

export const getCycleLabel = (cycle) => {
  if (cycle.every === 1) {
    if (cycle.time === 'DAYS') return 'Daily';
    if (cycle.time === 'WEEKS') return 'Weekly';
    if (cycle.time === 'MONTHS') return 'Monthly';
    if (cycle.time === 'YEARS') return 'Annually';
  }
  return `Every ${cycle.every} ${cycle.time.toLowerCase()}`;
};

export const getPaymentCount = (startDate, endDate, cycle) => {
  if (endDate < startDate) {
    return 0;
  }

  if (cycle.time === 'DAYS') {
    return Math.floor(differenceInDays(endDate, startDate) / cycle.every) + 1;
  }

  if (cycle.time === 'WEEKS') {
    return Math.floor(differenceInWeeks(endDate, startDate) / cycle.every) + 1;
  }

  if (cycle.time === 'MONTHS') {
    return Math.floor(differenceInMonths(endDate, startDate) / cycle.every) + 1;
  }

  if (cycle.time === 'YEARS') {
    return Math.floor(differenceInYears(endDate, startDate) / cycle.every) + 1;
  }

  return 0;
};