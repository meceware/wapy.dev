'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Fuse from 'fuse.js';
import { isThisMonth, addMonths, isBefore } from 'date-fns';
import { SearchBar } from '@/components/search-bar';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { SubscriptionCard } from '@/components/subscriptions/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { SubscriptionGetNextFuturePaymentDate } from '@/components/subscriptions/lib';

export function SubscriptionList({ subscriptions }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState(searchParams.get('s') || '');

  const allCategories = {
    ...subscriptions.flatMap(sub => sub.categories?.map(cat => cat.name) || [])
      .reduce((acc, category) => ({...acc, [category]: true}), {}),
    ...(subscriptions.some(sub => !sub.categories?.length) ? {'Uncategorized': true} : {})
  };

  const [selectedCategories, setSelectedCategories] = useState(allCategories);
  const [enabledFilter, setEnabledFilter] = useState(true);
  const [disabledFilter, setDisabledFilter] = useState(false);
  const [thisMonthFilter, setThisMonthFilter] = useState(false);
  const [next30DaysFilter, setNext30DaysFilter] = useState(false);

  // Initialize Fuse instance once
  const fuse = useMemo(() => new Fuse(subscriptions, {
    keys: ['name'],
    threshold: 0.3,
    sortFn: (a, b) => {
      // First sort by enabled status
      if (a.item.enabled !== b.item.enabled) {
        return b.item.enabled ? 1 : -1;
      }
      // Then by Fuse score (lower is better)
      return a.score - b.score;
    }
  }), [subscriptions]);

  const getResults = useCallback(() => {
    const results = filter
      ? fuse.search(filter).map(result => result.item)
      : subscriptions;

    return results.filter(sub => {
      const nextPayment = SubscriptionGetNextFuturePaymentDate(sub);
      const isThisMonthPayment = isThisMonth(nextPayment);
      const isNext30DaysPayment = isBefore(nextPayment, addMonths(new Date(), 1));

      return (
          sub.categories?.length
          ? sub.categories.some(cat => selectedCategories[cat.name])
          : selectedCategories['Uncategorized']
        ) && (
          enabledFilter && disabledFilter ||
          (enabledFilter && sub.enabled) ||
          (disabledFilter && !sub.enabled)
        ) && (
          (!thisMonthFilter && !next30DaysFilter) ||
          (thisMonthFilter && isThisMonthPayment) ||
          (next30DaysFilter && isNext30DaysPayment)
        );
    });
  }, [subscriptions, filter, fuse, selectedCategories, enabledFilter, disabledFilter, thisMonthFilter, next30DaysFilter]);

  const [filteredSubscriptions, setFilteredSubscriptions] = useState(getResults());

  const toggleCategory = (category) => {
    setSelectedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  useEffect(() => {
    const newUrl = filter ? `/?s=${encodeURIComponent(filter)}` : '/';
    router.push(newUrl, { scroll: false });
  }, [filter, router]);

  useEffect(() => {
    setFilteredSubscriptions(getResults());
  }, [getResults]);

  return (
    <>
      <div className='flex flex-col-reverse sm:flex-row items-center w-full gap-4'>
        <Button asChild className='w-full sm:w-auto'>
          <Link href='/edit/new' className='shrink-0'>
            <Icons.add />
            New Subscription
          </Link>
        </Button>
        <div className='flex flex-row gap-2 grow w-full sm:w-auto'>
          <SearchBar value={filter} onChange={setFilter} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='lg' className='px-4'>
                <Icons.filter />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56'>
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={enabledFilter}
                onCheckedChange={() => setEnabledFilter(!enabledFilter)}
                onSelect={(event) => event.preventDefault()}
              >
                Active
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={disabledFilter}
                onCheckedChange={() => setDisabledFilter(!disabledFilter)}
                onSelect={(event) => event.preventDefault()}
              >
                Inactive
              </DropdownMenuCheckboxItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Time Period</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={thisMonthFilter}
                onCheckedChange={() => {
                  setThisMonthFilter(!thisMonthFilter);
                  if (next30DaysFilter) setNext30DaysFilter(false);
                }}
                onSelect={(event) => event.preventDefault()}
              >
                This Month
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={next30DaysFilter}
                onCheckedChange={() => {
                  setNext30DaysFilter(!next30DaysFilter);
                  if (thisMonthFilter) setThisMonthFilter(false);
                }}
                onSelect={(event) => event.preventDefault()}
              >
                Next 30 Days
              </DropdownMenuCheckboxItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Categories</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.keys(selectedCategories).map((category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={selectedCategories[category]}
                  onCheckedChange={() => toggleCategory(category)}
                  onSelect={(event) => event.preventDefault()}
                >
                  {category}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className='flex flex-col gap-4 w-full'>
        {filteredSubscriptions.length === 0 ? (
          <div className='text-center text-muted-foreground py-8'>
            No subscriptions found
          </div>
        ) : (
          filteredSubscriptions.map((subscription) => (
            <SubscriptionCard key={subscription.id} subscription={subscription} />
          ))
        )}
      </div>
    </>
  );
}
