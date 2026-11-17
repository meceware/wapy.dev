'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useEventListener, useDebounceCallback } from 'usehooks-ts';
import { Input } from '@/components/ui/input';

const SearchBar = ( { value, onChange } ) => {
  const t = useTranslations('components.searchBar');
  const inputRef = useRef();
  const [search, setSearch] = useState(value);
  const debouncedChangeHandler = useDebounceCallback( onChange, 500 );

  useEventListener( 'keydown', ( e ) => {
    if ( e.ctrlKey && e.key === 'k' ) {
      e.preventDefault();
      inputRef.current?.focus();
    }
  } );

  useEffect( () => {
    setSearch( value );
  }, [ value ] );

  const onSearchChange = ( e ) => {
    setSearch( e.target.value );
    debouncedChangeHandler( e.target.value );
  };

  return (
    <div className='relative w-full'>
      <Input ref={ inputRef } type='search' value={ search } onChange={ onSearchChange } placeholder={t('placeholder')}
        className='h-10 pe-12 [&::-webkit-search-cancel-button]:hidden'
      />
      <div className='absolute end-1.5 top-0 flex h-full items-center'>
        <kbd className='pointer-events-none flex select-none gap-1 rounded border px-1.5 py-1 font-mono text-xs font-medium'>
          <span className='text-xs'>⌘</span>K
        </kbd>
      </div>
    </div>
  );
};

export { SearchBar };