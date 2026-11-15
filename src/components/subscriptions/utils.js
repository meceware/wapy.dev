import { DefaultCurrencies } from '@/config/currencies';
import { differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears } from 'date-fns';

export const formatPrice = (price, currencySymbol) => {
  const currency = DefaultCurrencies[currencySymbol] || DefaultCurrencies.EUR;
  const decimals = currency.decimals ?? 2;
  // de-DE grouping gives dot thousands separators, e.g. 1.500.000 ₫
  const amount = Number(price).toLocaleString('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return currency.position === 'before'
    ? `${currency.symbol}${amount}`
    : `${amount} ${currency.symbol}`;
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