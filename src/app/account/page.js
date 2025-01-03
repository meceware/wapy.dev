'use server';

import { auth } from '@/lib/auth';
import { withAuth } from '@/lib/with-auth';
import { AccountSettings } from './account-container';

const PageAccount = async () => {
  const session = await auth();
  const { id: _, ...userWithoutId } = session.user;

  return (
    <div className='container flex flex-col items-center justify-center gap-6 text-center'>
      <AccountSettings user={userWithoutId}/>
    </div>
  );
};

export default withAuth(PageAccount);

export async function generateMetadata() {
  return {
    title: 'Account',
  };
};
