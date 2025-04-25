'use client';

import { useState, useEffect } from 'react';
import { isThisMonth, addMonths, isBefore } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { SubscriptionGetNextFuturePaymentDate } from '@/components/subscriptions/lib';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from '@/components/ui/responsive-dialog';
import { DefaultCurrencies } from '@/config/currencies';

export const FilterPanel = ({
  categories,
  currencies,
  filteredSubscriptions,
  setFilteredSubscriptions,
}) => {
  const [selectedCategories, setSelectedCategories] = useState(categories);
  const [enabledFilter, setEnabledFilter] = useState(true);
  const [disabledFilter, setDisabledFilter] = useState(false);
  const [thisMonthFilter, setThisMonthFilter] = useState(false);
  const [next30DaysFilter, setNext30DaysFilter] = useState(false);
  const [selectedCurrencies, setSelectedCurrencies] = useState(
    currencies.reduce((acc, currency) => ({...acc, [currency]: true}), {})
  );

  const toggleCategory = (category) => {
    setSelectedCategories(prev => ({
      ...prev,
      [category]: {status: !prev[category].status, color: prev[category].color}
    }));
  };

  const toggleAllCategories = (value) => {
    setSelectedCategories(
      Object.keys(selectedCategories).reduce((acc, category) => ({
      ...acc,
      [category]: {status: value, color: selectedCategories[category].color}
      }), {})
    );
  };

  const toggleCurrency = (currency) => {
    setSelectedCurrencies(prev => ({
      ...prev,
      [currency]: !prev[currency]
    }));
  };

  const toggleAllCurrencies = (value) => {
    setSelectedCurrencies(
      Object.keys(selectedCurrencies).reduce((acc, currency) => ({
        ...acc,
        [currency]: value
      }), {})
    );
  };

  useEffect(() => {
    const result = filteredSubscriptions.filter(sub => {
      const nextPayment = SubscriptionGetNextFuturePaymentDate(sub);
      const isThisMonthPayment = isThisMonth(nextPayment);
      const isNext30DaysPayment = isBefore(nextPayment, addMonths(new Date(), 1));

      return (
          sub.categories?.length
          ? sub.categories.some(cat => selectedCategories[cat.name].status)
          : selectedCategories['Uncategorized'].status
        ) && (
          enabledFilter && disabledFilter ||
          (enabledFilter && sub.enabled) ||
          (disabledFilter && !sub.enabled)
        ) && (
          (!thisMonthFilter && !next30DaysFilter) ||
          (thisMonthFilter && isThisMonthPayment) ||
          (next30DaysFilter && isNext30DaysPayment)
        ) && (
          selectedCurrencies[sub.currency]
        );
    });

    setFilteredSubscriptions(result);
  }, [filteredSubscriptions, selectedCategories, enabledFilter, disabledFilter, thisMonthFilter, next30DaysFilter, selectedCurrencies]);

  return (
    <>
      <ResponsiveDialog close>
        <ResponsiveDialogTrigger asChild>
          <Button variant='outline' size='lg' className='px-4 cursor-pointer' title='Filter subscriptions'>
            <Icons.filter />
          </Button>
        </ResponsiveDialogTrigger>
        <ResponsiveDialogContent className='max-w-2xl gap-0 p-4 sm:p-6'>
          <ResponsiveDialogHeader className='text-left p-0 py-4 sm:py-4'>
            <div className='flex items-start justify-between'>
              <div>
                <ResponsiveDialogTitle className='text-lg'>Subscription Filters</ResponsiveDialogTitle>
                <ResponsiveDialogDescription className='text-sm'>Apply filters and find the subscriptions you need</ResponsiveDialogDescription>
              </div>
              <Button variant='outline' size='icon' title='Reset filters' className='shrink-0 cursor-pointer' onClick={() => {
                  setEnabledFilter(true);
                  setDisabledFilter(false);
                  setThisMonthFilter(false);
                  setNext30DaysFilter(false);
                  setSelectedCategories(categories);
                  setSelectedCurrencies(currencies.reduce((acc, currency) => ({...acc, [currency]: true}), {}));
                }}>
                <Icons.filterX />
              </Button>
            </div>
          </ResponsiveDialogHeader>

          <ScrollArea viewportClassName='max-h-[60vh]'>
            <div className='flex flex-col gap-4'>
              {/* Status Filter Section */}
              <div className='flex flex-col gap-2'>
                <h3 className='text-sm font-medium'>Status</h3>
                <div className='flex gap-4'>
                  <Toggle
                    pressed={enabledFilter}
                    onPressedChange={() => setEnabledFilter(!enabledFilter)}
                    variant='outline'
                    className='gap-2 px-4 py-2 h-auto cursor-pointer border-l-4 data-[state=on]:border-l-green-500'
                    title='Filter by active subscriptions'
                  >
                    <div className='size-3 rounded-full bg-green-500' />
                    Active
                  </Toggle>
                  <Toggle
                    pressed={disabledFilter}
                    onPressedChange={() => setDisabledFilter(!disabledFilter)}
                    variant='outline'
                    className='gap-2 px-4 py-2 h-auto cursor-pointer border-l-4 data-[state=on]:border-l-green-500'
                    title='Filter by inactive subscriptions'
                  >
                    <div className='size-3 rounded-full bg-red-500' />
                    Inactive
                  </Toggle>
                </div>
              </div>

              <Separator />

              <div className='flex flex-col gap-2'>
                <h3 className='text-sm font-medium'>Payment Date</h3>
                <div className='flex gap-4'>
                  <Toggle
                    pressed={!thisMonthFilter && !next30DaysFilter}
                    onPressedChange={() => {
                      setThisMonthFilter(false);
                      setNext30DaysFilter(false);
                    }}
                    variant='outline'
                    className='gap-2 px-4 py-2 h-auto cursor-pointer border-l-4 data-[state=on]:border-l-green-500'
                    title='Disable all payment date filters'
                  >
                    All
                  </Toggle>
                  <Toggle
                    pressed={thisMonthFilter}
                    onPressedChange={() => {
                      setThisMonthFilter(!thisMonthFilter);
                      setNext30DaysFilter(false);
                    }}
                    variant='outline'
                    className='gap-2 px-4 py-2 h-auto cursor-pointer border-l-4 data-[state=on]:border-l-green-500'
                    title='Filter by this month'
                  >
                    This Month
                  </Toggle>
                  <Toggle
                    pressed={next30DaysFilter}
                    onPressedChange={() => {
                      setNext30DaysFilter(!next30DaysFilter);
                      setThisMonthFilter(false);
                    }}
                    variant='outline'
                    className='gap-2 px-4 py-2 h-auto cursor-pointer border-l-4 data-[state=on]:border-l-green-500'
                    title='Filter by next 30 days'
                  >
                    Next 30 Days
                  </Toggle>
                </div>
              </div>

              <Separator />

              {currencies.length > 1 && (
                <>
                  <div className='flex flex-col gap-2'>
                    <div className='flex justify-between items-center'>
                      <h3 className='text-sm font-medium'>Currencies</h3>
                      <div className='flex gap-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => toggleAllCurrencies(true)}
                          className='h-8 px-3 text-xs cursor-pointer'
                          title='Select all currencies'
                        >
                          Select All
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => toggleAllCurrencies(false)}
                          className='h-8 px-3 text-xs cursor-pointer'
                          title='Clear all currencies'
                        >
                          Select None
                        </Button>
                      </div>
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      {currencies.map((currency) => (
                        <Toggle
                          key={currency}
                          pressed={selectedCurrencies[currency]}
                          onPressedChange={() => toggleCurrency(currency)}
                          variant='outline'
                          className='text-xs gap-2 px-2 py-1 h-auto cursor-pointer border-l-4 data-[state=on]:border-l-green-500'
                          title={`Filter by ${DefaultCurrencies[currency].name}`}
                        >
                          <span>
                            {DefaultCurrencies[currency].symbol}
                          </span>
                          {DefaultCurrencies[currency].name}
                        </Toggle>
                      ))}
                    </div>
                  </div>

                  <Separator />
                </>
              )}

              <div className='flex flex-col gap-2'>
                <div className='flex justify-between items-center'>
                  <h3 className='text-sm font-medium'>Categories</h3>
                  <div className='flex gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => toggleAllCategories(true)}
                      className='h-8 px-3 text-xs cursor-pointer'
                      title='Select all categories'
                    >
                      Select All
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => toggleAllCategories(false)}
                      className='h-8 px-3 text-xs cursor-pointer'
                      title='Clear all categories'
                    >
                      Select None
                    </Button>
                  </div>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {Object.keys(selectedCategories)
                    .sort()
                    .map((category) => (
                      <Toggle
                        key={category}
                        pressed={selectedCategories[category].status}
                        onPressedChange={() => toggleCategory(category)}
                        variant='outline'
                        className='text-xs gap-2 px-2 py-1 h-auto cursor-pointer border-l-4 data-[state=on]:border-l-green-500'
                        title={`Filter by ${category}`}
                      >
                        <span className='size-2 rounded-full' style={{
                          backgroundColor: selectedCategories[category].color,
                        }} />
                        {category}
                      </Toggle>
                    ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </>
  );
};