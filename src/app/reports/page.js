'use server';

import { withAuth } from '@/lib/with-auth';
import { prisma } from '@/lib/prisma';
import { SubscriptionReports } from '@/components/subscriptions/reports';
import { paddleGetSession } from '@/lib/paddle/status';
import { SubscriptionGuard } from '@/components/subscription-guard';

const PageReports = async () => {
  const { user, paddleStatus } = await paddleGetSession();

  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: user.id,
    },
    include: {
      categories: {
        select: {
          id: true,
          name: true,
          color: true
        }
      }
    },
    orderBy: {
      paymentDate: 'asc'
    }
  });

  return (
    <SubscriptionGuard paddleStatus={paddleStatus}>
      <div className='flex flex-col items-center w-full max-w-3xl gap-4'>
        <SubscriptionReports subscriptions={ subscriptions?.map(({ userId, ...rest }) => rest) } />
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