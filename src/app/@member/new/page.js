'use server';

import { auth } from '@/lib/auth';
import { SubscriptionEdit } from '@/components/subscriptions/edit';
import { UserGetCategories } from '@/app/@member/account/actions';

export default async function PageNewSubscriptionMember() {
  const session = await auth();
  const user = session?.user;
  const { id: _, ...userWithoutId } = user;
  const categories = await UserGetCategories();

  return (
    <div className='container flex flex-col items-center justify-center gap-6 text-center'>
      <SubscriptionEdit user={userWithoutId} categories={categories} />
    </div>
  )
}
