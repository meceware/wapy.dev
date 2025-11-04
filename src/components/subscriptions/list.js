'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Fuse from 'fuse.js';
import { SearchBar } from '@/components/search-bar';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { SubscriptionCard } from '@/components/subscriptions/card';
import { FilterPanel } from '@/components/subscriptions/filter';

export function SubscriptionList({ subscriptions, externalServices }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchFilter, setSearchFilter] = useState(searchParams.get('s') || '');

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

  useEffect(() => {
    const currentSearchParam = searchParams.get('s') || '';
    if (currentSearchParam !== searchFilter) {
      setSearchFilter(currentSearchParam);
    }
  }, [searchParams]);

  const filterBySearch = useCallback(() => {
    return searchFilter
      ? fuse.search(searchFilter).map(result => result.item)
      : subscriptions;
  }, [subscriptions, searchFilter, fuse]);

  const [searchFilteredSubscriptions, setSearchFilteredSubscriptions] = useState(filterBySearch());
  const [filteredSubscriptions, setFilteredSubscriptions] = useState(filterBySearch());

  useEffect(() => {
    const newUrl = searchFilter ? `/?s=${encodeURIComponent(searchFilter)}` : '/';
    router.push(newUrl, { scroll: false });
  }, [searchFilter, router]);

  useEffect(() => {
    setSearchFilteredSubscriptions(filterBySearch());
  }, [filterBySearch]);

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
          <SearchBar value={searchFilter} onChange={setSearchFilter} />
          <FilterPanel
            categories={{
              ...subscriptions.flatMap(sub => sub.categories?.map(cat => ({name: cat.name, color: cat.color})) || [])
                .reduce((acc, category) => ({...acc, [category.name]: {status: true, color: category.color}}), {}),
              ...(subscriptions.some(sub => !sub.categories?.length) ? {'Uncategorized': {status: true}} : {})
            }}
            paymentMethods={{
              ...subscriptions.flatMap(sub => sub.paymentMethods?.map(cat => ({name: cat.name, icon: cat.icon})) || [])
                .reduce((acc, paymentMethod) => ({...acc, [paymentMethod.name]: {status: true, icon: paymentMethod.icon}}), {}),
              ...(subscriptions.some(sub => !sub.paymentMethods?.length) ? {'Unspecified': {status: true}} : {})
            }}
            currencies={Array.from(new Set(subscriptions.map(sub => sub.currency)))}
            filteredSubscriptions={searchFilteredSubscriptions}
            setFilteredSubscriptions={setFilteredSubscriptions}
          />
        </div>
      </div>

      <div className='flex flex-col gap-4 w-full'>
        {filteredSubscriptions.length === 0 ? (
          <div className='text-center text-muted-foreground py-8'>
            No subscriptions found
          </div>
        ) : (
          filteredSubscriptions.map((subscription) => (
            <SubscriptionCard key={subscription.id} subscription={subscription} externalServices={externalServices} />
          ))
        )}
      </div>
    </>
  );
}
