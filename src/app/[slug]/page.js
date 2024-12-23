'use server';

import { auth } from '@/lib/auth';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { SubscriptionGet } from '@/components/subscriptions/actions';

export default async function PageSubscriptionEdit({ params }) {
  const slug = (await params).slug;
  return (
    <ProtectedRoute requireAuth={ true }>
      <></>
    </ProtectedRoute>
  );
}


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
      title: subscription?.name || 'Subscription',
  }
}