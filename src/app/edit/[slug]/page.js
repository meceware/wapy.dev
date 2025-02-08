'use server';

import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { withAuth } from '@/lib/with-auth';
import { SubscriptionGet } from '@/components/subscriptions/actions';
import { SubscriptionEdit } from '@/components/subscriptions/edit';
import { paddleGetSession } from '@/lib/paddle/status';
import { SubscriptionGuard } from '@/components/subscription-guard';

const PageSubscriptionEdit = async ({ params }) => {
  const slug = (await params).slug;
  const { user, userWithoutId, paddleStatus } = await paddleGetSession();

  const subscription = await SubscriptionGet(slug, user.id);
  if (!subscription) {
    return notFound();
  }

  if (subscription?.userId) {
    delete subscription.userId;
  }

  return (
    <SubscriptionGuard paddleStatus={paddleStatus}>
      <div className='container flex flex-col items-center justify-center gap-6 text-center'>
        <SubscriptionEdit user={userWithoutId} subscription={ subscription } />
      </div>
    </SubscriptionGuard>
  )
}

export default withAuth(PageSubscriptionEdit);

export async function generateMetadata({ params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      title: 'Unauthorized',
    }
  }

  const subscriptionId = (await params).slug;
  const subscription = await SubscriptionGet(subscriptionId, session?.user?.id);
  return {
      title: subscription?.name || 'Not Found',
  };
}