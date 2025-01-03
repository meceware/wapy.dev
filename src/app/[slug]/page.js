'use server';

import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { withAuth } from '@/lib/with-auth';
import { SubscriptionGet } from '@/components/subscriptions/actions';
import { UserGetCategories } from '@/app/account/actions';
import { SubscriptionEdit } from '@/components/subscriptions/edit';

const PageSubscriptionEdit = async ({ params }) => {
  const session = await auth();
  const slug = (await params).slug;

  const { id: _, ...userWithoutId } = session.user;
  const subscription = await SubscriptionGet(slug, session.user.id);

  if (!subscription) {
    return notFound();
  }

  if (subscription?.userId) {
    delete subscription.userId;
  }

  const allCategories = await UserGetCategories();

  return (
    <div className='container flex flex-col items-center justify-center gap-6 text-center'>
      <SubscriptionEdit user={userWithoutId} subscription={ subscription } categories={ allCategories } />
    </div>
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
      title: subscription?.name || 'Subscription',
  };
}