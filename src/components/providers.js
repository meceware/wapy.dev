'use client';

import { useEffect, useState, useCallback } from 'react';
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { NotificationsContext } from '@/components/notifications/notification-context';


export function SessionProvider({ children }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}

export function ThemeProvider( { children,...props} ) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export function PushNotificationProvider({ children }) {
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationsStatus, setNotificationsStatus] = useState('');

  const getPushSubscription = useCallback(async () => {
    try {
      // Check if service worker is registered and has push subscription
      if ('serviceWorker' in navigator) {
        if (navigator?.serviceWorker?.ready) {
          const registration = await navigator.serviceWorker.ready;
          if (registration?.pushManager) {
            const pushSubscription = await registration.pushManager.getSubscription();
            return { success: true, subscription: pushSubscription };
          }
        }
      }
    } catch (error) {
      // Nothing to do
    }

    return { success: false, subscription: null };
  });

  const updateNotificationStatus = useCallback(() => {
    // Check browser permission
    if ('Notification' in window) {
      setNotificationsStatus(Notification.permission);
    }
  });

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }

    // Check browser permission
    updateNotificationStatus();
  }, []);

  useEffect(() => {
    // Update browser permission
    updateNotificationStatus();
  }, [showNotificationModal]);

  return (
    <NotificationsContext.Provider
      value={ {
        showNotificationModal: showNotificationModal,
        setShowNotificationModal: setShowNotificationModal,
        notificationsStatus : notificationsStatus,
        getPushSubscription: getPushSubscription,
      } }
    >
      {children}
    </NotificationsContext.Provider>
  );
}
