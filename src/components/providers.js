'use client';

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  }, []);

  return (
    <NotificationsContext.Provider value={{ showNotificationModal, setShowNotificationModal }}>
      {children}
    </NotificationsContext.Provider>
  );
}
