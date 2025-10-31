'use server';

import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/with-auth';
import { SubscriptionList } from '@/components/subscriptions/list';

const HomeMember = async ({ userId, settings }) => {
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
      },
      paymentMethods: {
        select: {
          id: true,
          name: true,
          icon: true
        }
      },
      _count: {
        select: {
          pastPayments: true
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
};

export default withAuth(HomeMember);