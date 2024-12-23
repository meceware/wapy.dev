'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Fuse from 'fuse.js';
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
      // Handle uncategorized subscriptions
      if (!sub.categories?.length) {
        return selectedCategories['Uncategorized'];
      }

      return sub.categories.some(cat => selectedCategories[cat.name]) &&
        (enabledFilter && disabledFilter ||
         (enabledFilter && sub.enabled) ||
         (disabledFilter && !sub.enabled));
    });
  }, [subscriptions, filter, fuse, selectedCategories, enabledFilter, disabledFilter]);

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
          <Link href='/new' className='shrink-0'>
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
              >
                Active
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={disabledFilter}
                onCheckedChange={() => setDisabledFilter(!disabledFilter)}
              >
                Inactive
              </DropdownMenuCheckboxItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Categories</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.keys(selectedCategories).map((category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={selectedCategories[category]}
                  onCheckedChange={() => toggleCategory(category)}
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
