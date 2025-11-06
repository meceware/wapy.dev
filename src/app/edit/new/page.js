'use server';

import { withAuth } from '@/lib/with-auth';
import { SubscriptionEdit } from '@/components/subscriptions/edit';
import { paddleGetSession } from '@/lib/paddle/status';
import { SubscriptionGuard } from '@/components/subscription-guard';

const PageNewSubscription = async () => {
  const { user, paddleStatus } = await paddleGetSession();

  return (
    <SubscriptionGuard paddleStatus={paddleStatus}>
      <div className='container flex flex-col items-center justify-center gap-6 text-center'>
        <SubscriptionEdit user={user} />
      </div>
    </SubscriptionGuard>
  )
}

export default withAuth(PageNewSubscription);

export async function generateMetadata() {
  return {
    title: 'New Subscription',
  };
};