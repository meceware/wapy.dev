'use server';

import { auth } from '@/lib/auth';
import { AccountSettings } from './account-container';

export default async function PageAccountMember() {
  const session = await auth();
  const user = session?.user;
  const { id: _, ...userWithoutId } = user;

  return (
    <div className='container flex flex-col items-center justify-center gap-6 text-center'>
      <AccountSettings user={userWithoutId}/>
    </div>
  );
}