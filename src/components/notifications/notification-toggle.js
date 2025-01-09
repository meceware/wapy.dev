'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { PushNotificationSubscribe } from '@/components/notifications/actions';
import { Button } from '@/components/ui/button';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogFooter,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
} from '@/components/ui/responsive-dialog';
import { Icons } from '@/components/icons';
import { useNotifications } from '@/components/notifications/notification-context';

const STORAGE_KEY = 'notification-prompt-delay';
const DELAY_DAYS = 30;

const NotificationPermissionModal = ({ open, onOpenChange, onEnable, onMaybeLater, isEnabling }) => (
  <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
    <ResponsiveDialogContent className='sm:max-w-[425px]'>
      <ResponsiveDialogHeader>
        <ResponsiveDialogTitle className='flex items-center gap-2'>
          <Icons.bell className='size-6 text-primary' />
          Stay updated
        </ResponsiveDialogTitle>
        <ResponsiveDialogDescription>
          Get timely reminders about your subscription payments and due dates.
          We&apos;ll notify you before payments are due and when subscriptions are about to expire.
        </ResponsiveDialogDescription>
      </ResponsiveDialogHeader>
      <ResponsiveDialogFooter>
        <Button
          variant='outline'
          onClick={onMaybeLater}
          disabled={isEnabling}
        >
          Maybe Later
        </Button>
        <Button
          onClick={onEnable}
          disabled={isEnabling}
        >
          {isEnabling ? (
            <>
              <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
              Enabling...
            </>
          ) : (
            'Enable Notifications'
          )}
        </Button>
      </ResponsiveDialogFooter>
    </ResponsiveDialogContent>
  </ResponsiveDialog>
);

export const PushNotificationToggle = () => {
  const {
    showNotificationModal,
    setShowNotificationModal,
    getPushSubscription,
  } = useNotifications();
  const [ isEnabling, setIsEnabling ] = useState(false);

  const localStorageSet = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      timestamp: new Date().getTime(),
    }));
  };

  const localStorageRemove = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  const subscribeUser = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      const result = await PushNotificationSubscribe({
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.toJSON().keys.p256dh,
          auth: sub.toJSON().keys.auth,
        }
      });

      if (result.success) {
        toast.success('You will now receive subscription reminders.');
      } else {
        toast.error('Failed to enable notifications. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to enable notifications. Please try again.');
    }
  };

  const handleModalEnable = async () => {
    setIsEnabling(true);
    try {
      const result = await Notification.requestPermission();
      if (result === 'granted') {
        localStorageRemove();
        await subscribeUser();
      } else {
        localStorageSet();
        toast.error('Permission Required', {
          description: 'Please allow notifications to receive reminders.'
        });
      }
    } catch (error) {
      console.warn('Error enabling notifications:', error);
    } finally {
      setIsEnabling(false);
      setShowNotificationModal(false);
    }
  };

  useEffect(() => {
    const checkAndEnableNotifications = async () => {
      // Check if browser supports notifications
      if (!('Notification' in window)) {
        localStorageSet();
        return;
      }

      // Check if service worker is ready
      const pushSubscription = await getPushSubscription();
      if (!pushSubscription.success) {
        localStorageSet();
        return;
      }

      // Check existing subscription
      if (pushSubscription.subscription) {
        return; // Already subscribed
      }

      // Check permission status
      const permission = Notification.permission;
      if (permission === 'granted') {
        // Permission already granted, subscribe
        localStorageRemove();
        await subscribeUser();
      } else if (permission === 'default') {
        // Show modal first
        setShowNotificationModal(true);
      }
    };

    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      checkAndEnableNotifications();
      return;
    }

    const { timestamp } = JSON.parse(storedData);
    const now = new Date().getTime();
    const daysSincePrompt = (now - timestamp) / (1000 * 60 * 60 * 24);

    if (daysSincePrompt >= DELAY_DAYS) {
      checkAndEnableNotifications();
    }
  }, []);

  return (
    <NotificationPermissionModal
      open={showNotificationModal}
      onOpenChange={setShowNotificationModal}
      onEnable={handleModalEnable}
      onMaybeLater={() => {
        localStorageSet();
        setShowNotificationModal(false);
      }}
      isEnabling={isEnabling}
    />
  );
}