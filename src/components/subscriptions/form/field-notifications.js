'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
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
import { UserSubscriptionSendTestNotification } from '@/lib/notifications';

export const NotificationStatusManager = () => {
  const t = useTranslations('components.subscriptions.form.fields.notifications');
  const [hasPushSubscription, setHasPushSubscription] = useState(true);
  const {
    setShowNotificationModal,
    notificationsStatus,
    getPushSubscription,
  } = useNotifications();
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const checkPushSubscription = async () => {
      // Check if service worker is registered and has push subscription
      const pushSubscription = await getPushSubscription();
      if (pushSubscription?.success && pushSubscription?.subscription?.endpoint) {
        // Query database for push subscription
        const response = await PushNotificationCheckEndpoint(pushSubscription?.subscription?.endpoint);
        setHasPushSubscription(response?.success);
      } else {
        setHasPushSubscription(false);
      }
    };

    checkPushSubscription();
  }, []);

  const sendTestPushNotification = async () => {
    try {
      setTesting(true);
      const { success } = await UserSubscriptionSendTestNotification();
      if (success) {
        toast.success(t('toast.success'));
      } else {
        toast.error(t('toast.error'));
      }
    } catch (error) {
      toast.error(t('toast.error'));
    } finally {
      setTesting(false);
    }
  };

  return (
    <p className='text-sm text-muted-foreground'>
      {notificationsStatus === 'denied' && (
        <span className='text-destructive'>{t('status.denied')}</span>
      )}
      {notificationsStatus === 'default' && (
        <span className='text-orange-400'>
          {t.rich('status.default', {
            link: (chunks) => (
              <Button
                variant='link'
                type='button'
                onClick={() => setShowNotificationModal(true)}
                className='text-orange-400 p-0 h-auto inline-flex'
              >
                {chunks}
              </Button>
            )
          })}
        </span>
      )}
      {notificationsStatus === 'granted' && !hasPushSubscription && (
        <span className='text-orange-400'>
          {t.rich('status.grantedNotConfigured', {
            link: (chunks) => (
              <Button
                variant='link'
                type='button'
                onClick={() => setShowNotificationModal(true)}
                className='text-orange-400 p-0 h-auto inline-flex underline cursor-pointer'
              >
                {chunks}
              </Button>
            )
          })}
        </span>
      )}
      {notificationsStatus === 'granted' && hasPushSubscription && (
        <span>
          {t.rich('status.grantedConfigured', {
            link: (chunks) => (
              <Button
                variant='link'
                disabled={testing}
                type='button'
                onClick={() => sendTestPushNotification()}
                className='p-0 h-auto inline-flex cursor-pointer'
              >
                {chunks}
                {testing && <Icons.spinner className='animate-spin ms-1' />}
              </Button>
            )
          })}
        </span>
      )}
    </p>
  );
};

export const NotificationsFieldManager = ({ field, externalServices, isLoading = false, children }) => {
  const t = useTranslations('components.subscriptions.form.fields.notifications');
  const tCommon = useTranslations('common');

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
    INSTANT: t('timeOptions.instant'),
    '15_MINUTES': t('timeOptions.15minutes'),
    '1_HOUR': t('timeOptions.1hour'),
    '2_HOURS': t('timeOptions.2hours'),
    '1_DAY': t('timeOptions.1day'),
    '2_DAYS': t('timeOptions.2days'),
    '1_WEEK': t('timeOptions.1week'),
    CUSTOM: t('timeOptions.custom'),
  };

  const unitOptions = {
    MINUTES: { min: 15 },
    HOURS: { min: 1 },
    DAYS: { min: 1 },
    WEEKS: { min: 1 }
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
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <NotificationStatusManager />
          {notifications.map((notification, index) => (
            <div key={index} className='flex flex-col gap-4 p-4 border rounded-md'>
              <div className='flex items-start gap-4'>
                <div className='flex flex-col gap-2 flex-1'>
                  <Label>{t('via')}</Label>
                  <ToggleGroup
                    type='multiple'
                    value={notification.type}
                    onValueChange={(e) => handleTypeChange(index, e)}
                    className='justify-start gap-2'
                  >
                    <ToggleGroupItem
                      value='PUSH'
                      aria-label={t('types.push.ariaLabel')}
                      title={t('types.push.label')}
                      className='data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border'
                    >
                      <Icons.bellRing/>
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value='EMAIL'
                      aria-label={t('types.email.ariaLabel')}
                      title={t('types.email.label')}
                      className='data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border'
                    >
                      <Icons.mail/>
                    </ToggleGroupItem>
                    {externalServices?.webhook?.enabled && (
                      <ToggleGroupItem
                        value='WEBHOOK'
                        aria-label={t('types.webhook.ariaLabel')}
                        title={t('types.webhook.label')}
                        className='data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border'
                      >
                        <Icons.webhook/>
                      </ToggleGroupItem>
                    )}
                    {externalServices?.ntfy?.enabled && (
                      <ToggleGroupItem
                        value='NTFY'
                        aria-label={t('types.ntfy.ariaLabel')}
                        title={t('types.ntfy.label')}
                        className='data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border'
                      >
                        <Icons.ntfy/>
                      </ToggleGroupItem>
                    )}
                    {externalServices?.discord?.enabled && (
                      <ToggleGroupItem
                        value='DISCORD'
                        aria-label={t('types.discord.ariaLabel')}
                        title={t('types.discord.label')}
                        className='data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border'
                      >
                        <Icons.discord/>
                      </ToggleGroupItem>
                    )}
                    {externalServices?.slack?.enabled && (
                      <ToggleGroupItem
                        value='SLACK'
                        aria-label={t('types.slack.ariaLabel')}
                        title={t('types.slack.label')}
                        className='data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border'
                      >
                        <Icons.slack/>
                      </ToggleGroupItem>
                    )}
                  </ToggleGroup>
                </div>
                <Button
                  variant='destructive'
                  size='icon'
                  onClick={() => {setDeleteDialogIndex(index); setDeleteDialogOpen(true);}}
                  className='flex-none'
                  type='button'
                  disabled={isLoading}
                >
                  <Icons.trash className='size-4' />
                </Button>
              </div>
              <div className='flex flex-col gap-2'>
                <Label>{t('whenToNotify')}</Label>
                <Select
                  value={notification.when}
                  onValueChange={(value) => handleWhenChange(index, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('whenPlaceholder')} />
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
                        <SelectValue placeholder={t('unitPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(unitOptions).map(([key, option]) => (
                          <SelectItem key={key} value={key}>
                            {t(`units.${key.toLowerCase()}`, { count: notification.due })}
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
            <Icons.add className='me-2 size-4' />
            {t('addNotification')}
          </Button>
          {children}
        </CardFooter>
      </Card>
      <ResponsiveDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <ResponsiveDialogContent className='sm:max-w-106.25'>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle className='flex items-center gap-2'>
              {t('deleteDialog.title')}
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription className='flex items-start'>
              {t('deleteDialog.description')}
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <ResponsiveDialogFooter>
            <Button
              variant='outline'
              onClick={() => setDeleteDialogOpen(false)}
              type='button'
            >
              {tCommon('cancel')}
            </Button>
            <Button
              onClick={() => {setDeleteDialogOpen(false); handleRemove(deleteDialogIndex);}}
              variant='destructive'
              type='button'
            >
              {tCommon('delete')}
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </>
  );
}

export const FormFieldNotifications = ({ field, externalServices }) => {
  return (
    <FormItem className='flex-1 truncate space-y-2'>
      <FormControl>
        <NotificationsFieldManager field={field} externalServices={externalServices} />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
