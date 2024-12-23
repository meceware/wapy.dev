'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SubscriptionReports } from '@/components/subscriptions/reports';

export default async function PageReportsMember() {
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
