'use server';

import { prisma } from '@/lib/prisma';
import { SubscriptionList } from '@/components/subscriptions/list';

export const HomeMember = async ({ userId, settings }) => {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: userId,
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
    omit: {
      userId: true,
    },
    orderBy: [
      {
        enabled: 'desc'
      },
      {
        paymentDate: 'asc'
      }
    ]
  });

  return (
    <div className='flex flex-col items-center w-full max-w-3xl gap-4'>
      <SubscriptionList subscriptions={subscriptions} settings={settings} />
    </div>
  );
}