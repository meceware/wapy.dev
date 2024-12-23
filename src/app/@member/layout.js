'use server';

import Header from '@/components/header';
import { PushNotificationProvider } from '@/components/providers';
import { HeaderMemberMainNavigation, HeaderMemberIconNavigation } from '@/components/header-member';
import { PushNotificationToggle } from '@/components/notifications/notification-toggle';

// Root Layout
export default async function RootLayoutMember({ children }) {
  return (
    <PushNotificationProvider>
      <Header mainNavigation={HeaderMemberMainNavigation} iconNavigation={HeaderMemberIconNavigation} />
      <main className='flex flex-col h-full grow items-center p-8 md:p-12'>
        <div className='container flex flex-col items-center gap-6 text-center grow'>
          { children }
        </div>
      </main>
      <PushNotificationToggle />
    </PushNotificationProvider>
  );
}
