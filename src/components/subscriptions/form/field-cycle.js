'use client';

import { useState } from 'react';
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export const FormFieldCycle = ({ field }) => {
  const convertCycleToWhen = (cycle) => {
    const { time = 'MONTHS', every = 1 } = cycle;
    if (time === 'DAYS' && every === 1) return 'DAILY';
    if (time === 'WEEKS' && every === 1) return 'WEEKLY';
    if (time === 'MONTHS' && every === 1) return 'MONTHLY';
    if (time === 'YEARS' && every === 1) return 'YEARLY';
    return 'CUSTOM';
  };

  const convertWhenToCycle = (when) => {
    if (when === 'DAILY') return { time: 'DAYS', every: 1 };
    if (when === 'WEEKLY') return { time: 'WEEKS', every: 1 };
    if (when === 'MONTHLY') return { time: 'MONTHS', every: 1 };
    if (when === 'YEARLY') return { time: 'YEARS', every: 1 };
    return { time: cycle.time, every: cycle.every };
  };

  const [cycle, setCycle] = useState({when: convertCycleToWhen(field.value), time: field.value?.time || 'MONTHS', every: field?.value?.every ? field?.value?.every : 1 });

  const timeOptions = {
    DAILY: 'Daily',
    WEEKLY: 'Weekly',
    MONTHLY: 'Monthly',
    YEARLY: 'Annually',
    CUSTOM: 'Custom',
  };

  const unitOptions = {
    DAYS: { label: 'Day', min: 1 },
    WEEKS: { label: 'Week', min: 1 },
    MONTHS: { label: 'Month', min: 1 },
    YEARS: { label: 'Year', min: 1 },
  };

  const handleWhenChange = (value) => {
    const newCycle = convertWhenToCycle(value);
    setCycle({
      ...newCycle,
      when: value
    });
    field.onChange(newCycle);
  };

  return (
    <FormItem>
      <FormLabel>Billing Cycle</FormLabel>
      <FormControl>
        <div className='flex flex-col gap-2'>
          <Select
            value={cycle.when}
            onValueChange={(value) => handleWhenChange(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select billing cycle' value={cycle.when} />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(timeOptions).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {cycle.when === 'CUSTOM' && (
            <div className='flex gap-2'>
              <Input
                type='number'
                min={unitOptions[cycle.time]?.min || 0}
                max={unitOptions[cycle.time]?.max}
                value={cycle.every}
                onChange={(e) => {
                  const value = e.target.value;
                  const parsed = /^\d+$/.test(value) ? parseInt(value) : 1;
                  setCycle({
                    ...cycle,
                    every: parsed
                  });
                  field.onChange({
                    time: cycle.time,
                    every: parsed
                  });
                }}
                className='flex-1 w-32'
              />
              <Select
                value={cycle.time || 'MONTHS'}
                onValueChange={(value) => {
                  setCycle({
                    ...cycle,
                    time: value
                  });
                  field.onChange({
                    time: value,
                    every: cycle.every
                  });
                }}
                className='flex-1 w-32'
              >
                <SelectTrigger>
                  <SelectValue placeholder='Unit' />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(unitOptions).map(([key, option]) => (
                    <SelectItem key={key} value={key}>
                      {`${option.label}${cycle.every > 1 ? 's' : ''}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}