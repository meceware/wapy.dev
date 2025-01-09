'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogFooter,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
} from '@/components/ui/responsive-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useNotifications } from '@/components/notifications/notification-context';
import {
  FormItem,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import { PushNotificationCheckEndpoint } from '@/components/notifications/actions';

export const NotificationStatusManager = () => {
  const [hasPushSubscription, setHasPushSubscription] = useState(true);
  const {
    setShowNotificationModal,
    notificationsStatus,
    getPushSubscription,
  } = useNotifications();

  useEffect(() => {
    const checkPushSubscription = async () => {
      // Check if service worker is registered and has push subscription
      const pushSubscription = await getPushSubscription();
      if (pushSubscription?.success && pushSubscription?.subscription?.endpoint) {
        // Query database for push subscription
        const response = await PushNotificationCheckEndpoint(pushSubscription.endpoint);
        setHasPushSubscription(response?.success);
      } else {
        setHasPushSubscription(false);
      }
    };

    checkPushSubscription();
  }, []);

  return (
    <>
      {notificationsStatus === 'denied' && (
        <span className='text-sm text-destructive'>Push notifications are blocked on this device. Please enable them in your browser settings.</span>
      )}
      {notificationsStatus === 'default' && (
        <>
          <span className='text-orange-400 text-sm'>Push notifications are not enabled on this device.</span>
          {' '}
          <Button variant='link' type='button' onClick={() => setShowNotificationModal(true)} className='text-orange-400 p-0 h-auto inline-flex'>Would you like to enable it?</Button>
        </>
      )}
      {notificationsStatus === 'granted' && !hasPushSubscription && (
        <>
          <span className='text-orange-400 text-sm'>Push notification permission is granted but it is not properly configured.</span>
          {' '}
          <Button variant='link' type='button' onClick={() => setShowNotificationModal(true)} className='text-orange-400 p-0 h-auto inline-flex underline'>Would you like to enable it?</Button>
        </>
      )}
    </>
  );
};

export const NotificationsFieldManager = ({ field, isLoading = false, children }) => {
  const convertTime = (time, due) => {
    if (time === 'INSTANT') return 'INSTANT';
    if (time === 'MINUTES' && due === 15) return '15_MINUTES';
    if (time === 'HOURS' && due === 1) return '1_HOUR';
    if (time === 'HOURS' && due === 2) return '2_HOURS';
    if (time === 'DAYS' && due === 1) return '1_DAY';
    if (time === 'DAYS' && due === 2) return '2_DAYS';
    if (time === 'WEEKS' && due === 1) return '1_WEEK';
    return 'CUSTOM';
  };

  const [notifications, setNotifications] = useState(field.value.map(n => ({
    ...n,
    when: convertTime(n.time, n.due)
  })));
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDialogIndex, setDeleteDialogIndex] = useState(-1);

  const timeOptions = {
    INSTANT: 'At Payment Date',
    '15_MINUTES': '15 minutes before',
    '1_HOUR': '1 hour before',
    '2_HOURS': '2 hours before',
    '1_DAY': '1 day before',
    '2_DAYS': '2 days before',
    '1_WEEK': '1 week before',
    CUSTOM: 'Custom',
  };

  const unitOptions = {
    MINUTES: { label: 'Minute', min: 15 },
    HOURS: { label: 'Hour', min: 1 },
    DAYS: { label: 'Day', min: 1 },
    WEEKS: { label: 'Week', min: 1 }
  };

  const isWhenUsed = (when) => {
    if (when === 'CUSTOM') return false;
    return notifications.some(n => n.when === when);
  };

  const handleAddNotification = () => {
    const getNextTime = () => {
      const timeKeys = Object.keys(timeOptions);
      const existingTimes = notifications.map(n => n.when);

      // Find first unused time option
      for (const timeKey of timeKeys) {
        if (!existingTimes.includes(timeKey)) {
          return timeKey;
        }
      }

      // If all standard options used, return CUSTOM
      return 'CUSTOM';
    };
    setNotifications([...notifications, { type: ['PUSH'], when: getNextTime(), time: 'HOURS', due: 1 }]);
  };

  const handleTypeChange = (index, types) => {
    const updated = [...notifications];
    updated[index].type = types;
    setNotifications(updated);
  };

  const timeFuncs = {
    INSTANT: (index, updated) => {
      updated[index].time = 'INSTANT';
      updated[index].due = 0;
    },
    '15_MINUTES': (index, updated) => {
      updated[index].time = 'MINUTES';
      updated[index].due = 15;
    },
    '1_HOUR': (index, updated) => {
      updated[index].time = 'HOURS';
      updated[index].due = 1;
    },
    '2_HOURS': (index, updated) => {
      updated[index].time = 'HOURS';
      updated[index].due = 2;
    },
    '1_DAY': (index, updated) => {
      updated[index].time = 'DAYS';
      updated[index].due = 1;
    },
    '2_DAYS': (index, updated) => {
      updated[index].time = 'DAYS';
      updated[index].due = 2;
    },
    '1_WEEK': (index, updated) => {
      updated[index].time = 'WEEKS';
      updated[index].due = 1;
    },
    CUSTOM: (index, updated) => {
      if (updated[index].time === 'INSTANT') {
        updated[index].time = 'HOURS';
        updated[index].due = 1;
      }
    }
  };

  const handleWhenChange = (index, when) => {
    const updated = [...notifications];
    updated[index].when = when;
    timeFuncs[when](index, updated);
    setNotifications(updated);
  };

  const handleTimeChange = (index, time) => {
    const updated = [...notifications];
    updated[index].time = time;
    setNotifications(updated);
  };

  const handleDueChange = (index, due) => {
    const updated = [...notifications];
    updated[index].due = due;
    setNotifications(updated);
  };

  const handleRemove = (index) => {
    setNotifications(notifications.filter((_, i) => i !== index));
  };

  useEffect(() => {
    for (let i = 0; i < notifications.length; i++) {
      timeFuncs[notifications[i].when](i, notifications);
    }
    field.onChange(notifications.map(({ when, ...rest }) => rest));
  }, [notifications]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Configure the default notifications for your subscriptions
          </CardDescription>
          <CardDescription className='whitespace-normal'>
            <NotificationStatusManager />
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {notifications.map((notification, index) => (
            <div key={index} className='flex flex-col gap-4 p-4 border rounded-md'>
              <div className='flex items-start gap-4'>
                <div className='flex flex-col gap-2 flex-1'>
                  <Label>Via</Label>
                  <ToggleGroup
                    type='multiple'
                    value={notification.type}
                    onValueChange={(e) => handleTypeChange(index, e)}
                    className='justify-start gap-2'
                  >
                    <ToggleGroupItem
                      value='PUSH'
                      aria-label='Toggle push'
                      title='Push Notifications'
                      className='data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border'
                    >
                      <Icons.bellRing/>
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value='EMAIL'
                      aria-label='Toggle email'
                      title='Email Notifications'
                      className='data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border'
                    >
                      <Icons.mail/>
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                <Button
                  variant='destructive'
                  size='icon'
                  onClick={() => {setDeleteDialogIndex(index); setDeleteDialogOpen(true);}}
                  className='flex-none'
                  type='button'
                >
                  <Icons.trash className='size-4' />
                </Button>
              </div>
              <div className='flex flex-col gap-2'>
                <Label>When to Notify</Label>
                <Select
                  value={notification.when}
                  onValueChange={(value) => handleWhenChange(index, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select when to notify' />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(timeOptions).map(([key, label]) => (
                      <SelectItem key={key} value={key} disabled={key !== notification.when && isWhenUsed(key)}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {notification.when === 'CUSTOM' && (
                <div className='flex-1 space-y-2'>
                  <div className='flex gap-2'>
                    <Input
                      type='number'
                      min={unitOptions[notification.time]?.min || 0}
                      max={unitOptions[notification.time]?.max || 60}
                      value={notification.due}
                      onChange={(e) => {
                        const value = e.target.value;
                        const parsed = /^\d+$/.test(value) ? parseInt(value) : 0;
                        handleDueChange(index, parsed);
                      }}
                      className='flex-1 w-32'
                    />
                    <Select
                      value={notification.time || 'MINUTES'}
                      onValueChange={(value) => handleTimeChange(index, value)}
                      className='flex-1 w-32'
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Unit' />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(unitOptions).map(([key, option]) => (
                          <SelectItem key={key} value={key}>
                            {`${option.label}${notification.due > 1 ? 's' : ''}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
        <CardFooter className='flex flex-col sm:flex-row justify-between gap-2'>
          <Button
            onClick={handleAddNotification}
            variant='secondary'
            className='w-full sm:w-auto'
            disabled={isLoading}
            type='button'
          >
            <Icons.add className='mr-2 size-4' />
            Add Notification Template
          </Button>
          {children}
        </CardFooter>
      </Card>
      <ResponsiveDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <ResponsiveDialogContent className='sm:max-w-[425px]'>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle className='flex items-center gap-2'>
              Confirm Delete
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription className='flex items-start'>
              Are you sure you want to remove this notification template?
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <ResponsiveDialogFooter>
            <Button
              variant='outline'
              onClick={() => setDeleteDialogOpen(false)}
              type='button'
            >
              Cancel
            </Button>
            <Button
              onClick={() => {setDeleteDialogOpen(false); handleRemove(deleteDialogIndex);}}
              variant='destructive'
              type='button'
            >
              Delete
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </>
  );
}

export const FormFieldNotifications = ({ field }) => {
  return (
    <FormItem className='flex-1 truncate space-y-2'>
      <FormControl>
        <NotificationsFieldManager field={field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
