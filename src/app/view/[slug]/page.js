'use server';

import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { withAuth } from '@/lib/with-auth';
import { SubscriptionGet } from '@/components/subscriptions/actions';
import { SubscriptionView } from '@/components/subscriptions/view';
import { paddleGetSession } from '@/lib/paddle/status';
import { SubscriptionGuard } from '@/components/subscription-guard';

const PageSubscriptionView = async ({ params }) => {
  const slug = (await params).slug;
  const { session, user, paddleStatus } = await paddleGetSession();

  const subscription = await SubscriptionGet(slug, session?.user?.id);
  if (!subscription) {
    return notFound();
  }

  return (
    <SubscriptionGuard paddleStatus={paddleStatus}>
      <div className='container flex flex-col items-center justify-center gap-6'>
        <SubscriptionView user={user} subscription={subscription} />
      </div>
    </SubscriptionGuard>
  );
};

export default withAuth(PageSubscriptionView);

export async function generateMetadata({ params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      title: 'Unauthorized',
    };
  }

  const subscriptionId = (await params).slug;
  const subscription = await SubscriptionGet(subscriptionId, session?.user?.id);
  return {
    title: subscription?.name ? `View ${subscription.name}` : 'Not Found',
  };
}