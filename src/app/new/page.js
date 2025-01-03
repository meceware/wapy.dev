'use server';

import { auth } from '@/lib/auth';
import { withAuth } from '@/lib/with-auth';
import { SubscriptionEdit } from '@/components/subscriptions/edit';
import { UserGetCategories } from '@/app/account/actions';

const PageNewSubscription = async () => {
  const session = await auth();
  const { id: _, ...userWithoutId } = session.user;
  const categories = await UserGetCategories();

  return (
    <div className='container flex flex-col items-center justify-center gap-6 text-center'>
      <SubscriptionEdit user={userWithoutId} categories={categories} />
    </div>
  )
}

export default withAuth(PageNewSubscription);

export async function generateMetadata({ params }) {
  return {
    title: 'New Subscription',
  };
};