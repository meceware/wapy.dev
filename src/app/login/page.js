'use server';

import { withAuth } from '@/lib/with-auth';
import { SignInForm } from './signin-form';

const PageLogin = async () => {
  return (
    <div className='flex flex-col grow justify-center items-center'>
      <SignInForm />
    </div>
  );
}

export default withAuth(PageLogin, /* isProtected */ false, /* isRedirected */ true);

export async function generateMetadata({ params }) {
  return {
    title: 'Sign In',
  };
};
