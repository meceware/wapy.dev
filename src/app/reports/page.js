'use server';

import { auth } from '@/lib/auth';
import { withAuth } from '@/lib/with-auth';
import { prisma } from '@/lib/prisma';
import { SubscriptionReports } from '@/components/subscriptions/reports';

const PageReports = async () => {
  const session = await auth();

  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: session.user.id,
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
    <div className='flex flex-col items-center w-full max-w-3xl gap-4'>
      <SubscriptionReports subscriptions={ subscriptions?.map(({ userId, ...rest }) => rest) } />
    </div>
  )
}

export default withAuth(PageReports);

export async function generateMetadata() {
  return {
    title: 'Subscription Report',
  };
};