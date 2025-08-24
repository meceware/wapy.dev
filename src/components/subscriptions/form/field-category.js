'use client';

import { useState, useRef, useEffect } from 'react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Icons } from '@/components/icons';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';

export const CategoryFieldManager = ({ field, categories }) => {
  const [open, setOpen] = useState(false);
  const [currentCategories, setCurrentCategories] = useState(categories);
  const [selectedCategories, setSelectedCategories] = useState(field.value || []);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    field.onChange(selectedCategories);
  }, [selectedCategories]);

  const CommandItemCreate = ({
    value,
    onSelect,
  }) => {
    if (value === '' || value.length < 3) return false;

    const hasNoCategory = !currentCategories
      .map(({ name }) => name.toLowerCase())
      .includes(`${value.toLowerCase()}`);

    if (!hasNoCategory) return false;

    return (
      <CommandItem
        key={`${value}`}
        value={`${value}`}
        className='text-sm text-muted-foreground bg-muted'
        onSelect={onSelect}
      >
        Create new category &quot;{value}&quot;
      </CommandItem>
    );
  };

  const onNewCategory = (name) => {
    const newCategory = {
      id: '',
      name: name,
      color: '#9e9e9e',
    };
    setSelectedCategories([
      ...selectedCategories,
      newCategory,
    ]);
    setCurrentCategories([
      ...currentCategories,
      newCategory,
    ]);
  };

  const onCategorySelect = (category) => {
    setSelectedCategories((currentCategories) =>
      currentCategories.some((c) => c.id === category.id && c.name === category.name)
        ? currentCategories.filter((c) => c.id !== category.id)
        : [...currentCategories, category]
    );
    inputRef?.current?.focus();
  };

  const deleteCategory = (name) => {
    setSelectedCategories((prev) =>
      prev.filter((f) => f.name !== name),
    );
  };

  const onOpenChange = (value) => {
    // If not refed, would scroll automatically to the bottom of page
    inputRef.current?.blur();
    setOpen(value);
    if (value) {
      setInputValue('');
    }
  };

  return (
    <div className='flex flex-col gap-2'>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            className='justify-between h-10 px-3 py-2 font-normal text-sm w-full hover:bg-transparent'
          >
            <span className='truncate'>
              {selectedCategories.length === 0 && 'Select categories'}
              {selectedCategories.length === 1 && `${selectedCategories.length} category selected`}
              {selectedCategories.length > 1 && `${selectedCategories.length} categories selected`}
            </span>
            <Icons.down className='ml-2 size-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='p-0 w-[300px] sm:w-[512px]' align='start'>
          <Command loop>
            <CommandInput
              ref={inputRef}
              value={inputValue}
              onValueChange={setInputValue}
              placeholder='Search category...'
            />
            <CommandList>
              <CommandGroup>
                {currentCategories.map((category) => {
                  const isActive = selectedCategories.some(c => c.id === category.id && c.name === category.name);
                  return (
                    <CommandItem
                      key={category.name}
                      value={category.name}
                      onSelect={() => onCategorySelect(category)}
                      className='gap-2'
                    >
                      <Icons.check
                        className={cn(
                          isActive ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <div className='flex-1 truncate'>{category.name}</div>
                      <div
                        className='size-4 rounded-full'
                        style={{ backgroundColor: category.color }}
                      />
                    </CommandItem>
                  );
                })}
                <CommandItemCreate
                  onSelect={() => onNewCategory(inputValue)}
                  value={inputValue}
                />
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <div className='flex flex-wrap gap-2'>
        {selectedCategories.map(({ name, color }) => (
          <Badge
            key={name}
            variant='outline'
            style={{backgroundColor: `${color}`}}
          >
            {name}
            <Icons.x className='ml-2 h-4 w-4 cursor-pointer' onClick={() => deleteCategory(name)} />
          </Badge>
        ))}
      </div>
    </div>
  );
}

export const FormFieldCategory = ({ field, categories }) => {
  return (
    <FormItem className='flex-1 truncate space-y-2'>
      <FormLabel>Categories</FormLabel>
      <FormControl>
        <CategoryFieldManager field={field} categories={categories} />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
