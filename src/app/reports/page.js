'use server';

import { withAuth } from '@/lib/with-auth';
import { prisma } from '@/lib/prisma';
import { SubscriptionReports } from '@/components/subscriptions/reports';
import { paddleGetSession } from '@/lib/paddle/status';
import { SubscriptionGuard } from '@/components/subscription-guard';

const PageReports = async () => {
  const { session, paddleStatus } = await paddleGetSession();

  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: session?.user?.id,
    },
    include: {
      categories: {
        select: {
          name: true,
          color: true
        }
      }
    },
    omit: {
      userId: true,
      createdAt: true,
      updatedAt: true,
      nextNotificationTime: true,
      nextNotificationDetails: true,
      notes: true,
    },
    orderBy: {
      paymentDate: 'asc'
    }
  });

  return (
    <SubscriptionGuard paddleStatus={paddleStatus}>
      <div className='flex flex-col items-center w-full max-w-3xl gap-4'>
        <SubscriptionReports subscriptions={subscriptions} />
      </div>
    </SubscriptionGuard>
  )
}

export default withAuth(PageReports);

export async function generateMetadata() {
  return {
    title: 'Subscription Report',
  };
};