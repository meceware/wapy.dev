'use server';

import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { SubscriptionGet } from '@/components/subscriptions/actions';
import { UserGetCategories } from '@/app/@member/account/actions';
import { SubscriptionEdit } from '@/components/subscriptions/edit';

export default async function PageSubscriptionMember({ params }) {
  const session = await auth();
  const slug = (await params).slug;
  const subscription = await SubscriptionGet(slug, session?.user?.id);

  if (!subscription) {
    return notFound();
  }

  if (subscription?.userId) {
    delete subscription.userId;
  }

  const allCategories = await UserGetCategories();

  return (
    <div className='container flex flex-col items-center justify-center gap-6 text-center'>
      <SubscriptionEdit subscription={ subscription } categories={ allCategories } />
    </div>
  )
}
