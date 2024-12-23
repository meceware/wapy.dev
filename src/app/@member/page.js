'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SubscriptionList } from '@/components/subscriptions/list';

export default async function PageHomeMember() {
  const session = await auth();
  if (!session || !session.user) {
    return false;
  }

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
