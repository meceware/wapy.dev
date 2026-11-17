'use client';

import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslations, useFormatter, useNow } from 'next-intl';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PastNotificationsGetUnread, PastNotificationsMarkAsRead, PastNotificationsMarkAllAsRead } from '@/components/notifications/actions';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

export function NotificationBell() {
  const t = useTranslations('components.notifications.bell');
  const formatter = useFormatter();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const now = useNow({
    updateInterval: 1000 * 30,
  });

  const fetchNotifications = async () => {
    return PastNotificationsGetUnread().then((data) => {
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    });
  };

  useEffect(() => {
    fetchNotifications();
    // Fetch notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id) => {
    const response = await PastNotificationsMarkAsRead(id);
    if (response.success) {
      fetchNotifications();
    }
  };

  const handleMarkAsReadAll = async (id) => {
    const response = await PastNotificationsMarkAllAsRead(id);
    if (response.success) {
      fetchNotifications().then(() => {
        setOpen(false);
      });
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon' className='relative cursor-pointer' title={t('title')}>
          <Bell className='h-5 w-5' />
          {unreadCount > 0 && (
            <span
              className='absolute top-0 end-0 size-4 rounded-full bg-red-500 text-white flex items-center justify-center'
              style={{
                fontSize: '0.6rem',
                lineHeight: '1rem',
              }}
              title={t('unreadTitle')}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80 p-0'>
        <ScrollArea className='h-80 p-4'>
          <div className='flex flex-row items-start justify-between gap-2'>
            <h4 className='font-medium leading-none mb-4'>{t('title')}</h4>
            {unreadCount > 0 && (
              <Button
                variant='ghost'
                size='icon'
                className='size-4 rounded-full cursor-pointer bg-red-500 hover:bg-red-600'
                onClick={() => handleMarkAsReadAll()}
                title={t('clearAll')}
              />
            )}
          </div>
          {notifications.length === 0 ? (
            <p className='text-sm text-muted-foreground'>{t('noNotifications')}</p>
          ) : (
            <div className='space-y-4'>
              {notifications.slice(0, 20).map((notification) => (
                <Card
                  key={notification.id}
                  className='bg-muted/50 gap-2 flex flex-col p-3'
                >
                  <CardHeader className='p-0 flex flex-row items-start justify-between gap-1'>
                    <div className='flex flex-col gap-1'>
                      <CardTitle>
                        {notification.title}
                      </CardTitle>
                      <CardDescription className='text-xs text-muted-foreground'>
                        {formatter.relativeTime(new Date(notification.createdAt), {
                          now: now,
                        })}
                      </CardDescription>
                    </div>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='size-3 rounded-full cursor-pointer bg-red-500 hover:bg-red-600 shrink-0'
                      onClick={() => handleMarkAsRead(notification.id)}
                      title={t('removeNotification')}
                    />
                  </CardHeader>
                  <CardContent className='text-sm p-0'>
                    {notification.message}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}