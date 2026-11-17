'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
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
import { useAuth } from '@/lib/auth-client';

const STORAGE_KEY = 'notification-prompt-delay';
const DELAY_DAYS = 30;

const NotificationPermissionModal = ({ open, onOpenChange, onEnable, onMaybeLater, isEnabling }) => {
  const t = useTranslations('components.notifications.toggle.modal');

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className='sm:max-w-106.25'>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className='flex items-center gap-2'>
            <Icons.bell className='size-6 text-primary' />
            {t('title')}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {t('description')}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogFooter>
          <Button
            variant='outline'
            onClick={onMaybeLater}
            disabled={isEnabling}
          >
            {t('maybeLater')}
          </Button>
          <Button
            onClick={onEnable}
            disabled={isEnabling}
          >
            {isEnabling ? (
              <>
                <Icons.spinner className='me-2 h-4 w-4 animate-spin' />
                {t('enabling')}
              </>
            ) : (
              t('enable')
            )}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};

const PushNotificationToggleContent = ({vapidPublicKey}) => {
  const t = useTranslations('components.notifications.toggle.toast');
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
        applicationServerKey: vapidPublicKey,
      });

      const result = await PushNotificationSubscribe({
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.toJSON().keys.p256dh,
          auth: sub.toJSON().keys.auth,
        }
      });

      if (result.success) {
        toast.success(t('success'));
      } else {
        toast.error(t('error'));
      }
    } catch (error) {
      toast.error(t('error'));
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
        toast.error(t('permissionRequired.title'), {
          description: t('permissionRequired.description')
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

export const PushNotificationToggle = (props) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;

  return <PushNotificationToggleContent {...props} />;
};