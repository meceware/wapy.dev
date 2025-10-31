'use server';

import { withAuth } from '@/lib/with-auth';
import { SignInForm } from './signin-form';

const PageLogin = async () => {
  const isGoogle = (process?.env?.GOOGLE_ID && process?.env?.GOOGLE_SECRET) ? true : false;
  const isGithub = (process?.env?.GITHUB_ID && process?.env?.GITHUB_SECRET) ? true : false;
  const isGenericAuth = (process?.env?.GENERIC_AUTH_PROVIDER && process?.env?.GENERIC_AUTH_CLIENT_ID && process?.env?.GENERIC_AUTH_CLIENT_SECRET && process?.env?.GENERIC_AUTH_ISSUER) ? true : false;
  const genericAuthProvider = isGenericAuth ? process?.env?.GENERIC_AUTH_PROVIDER : false;

  return (
    <div className='flex flex-col grow justify-center items-center w-full'>
      <SignInForm
        isGithub={ isGithub }
        isGoogle={ isGoogle }
        genericAuthProvider={ genericAuthProvider }
      />
    </div>
  );
}

export default withAuth(PageLogin, /* isProtected */ false, /* isRedirected */ true);

export async function generateMetadata({ params }) {
  return {
    title: 'Sign In',
  };
};
