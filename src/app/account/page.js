'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { withAuth } from '@/lib/with-auth';
import { AccountSettings } from './account-container';
import { paddleGetStatus } from '@/lib/paddle/status';
import { paddleGetSession } from '@/lib/paddle/status';

const PageAccount = async () => {
  const { user, paddleStatus } = await paddleGetSession();

  // const paddleCustomer = await paddleGetCustomer(user.id);
  // console.log('paddleCustomer', paddleCustomer);
  // const paddleSubscriptions = await paddleGetSubscriptions();
  // console.log('paddleSubscriptions', paddleSubscriptions);
  // const paddleSubscription = await paddleGetLatestSubscription();
  // console.log('paddleSubscription', paddleSubscription);

  return (
    <div className='container flex flex-col items-center justify-center gap-6 text-center'>
      <AccountSettings
        user={user}
        paddleStatus={paddleStatus}
     />
    </div>
  );
};

export default withAuth(PageAccount);

export async function generateMetadata() {
  return {
    title: 'Account',
  };
};
