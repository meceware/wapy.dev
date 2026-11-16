import { DefaultCurrencies } from '@/config/currencies';
import { getLanguageConfig } from '@/config/languages';
import { differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears } from 'date-fns';

const numberFormatters = new Map();

const getNumberFormatter = (locale, decimals) => {
  const key = `${locale}:${decimals}`;
  if (!numberFormatters.has(key)) {
    numberFormatters.set(key, new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }));
  }
  return numberFormatters.get(key);
};

export const formatPrice = (price, currencyCode, locale) => {
  const currency = DefaultCurrencies[currencyCode] || DefaultCurrencies.EUR;
  const decimals = currency.decimals ?? 2;
  const amount = getNumberFormatter(getLanguageConfig(locale).numberLocale || locale, decimals).format(Number(price));
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