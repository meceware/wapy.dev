'use server';

import { prisma } from '@/lib/prisma';
import { SubscriptionList } from '@/components/subscriptions/list';

export const HomeMember = async ({ userId }) => {
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
      <SubscriptionList subscriptions={ subscriptions?.map(({ userId, ...rest }) => rest) } />
    </div>
  );
}