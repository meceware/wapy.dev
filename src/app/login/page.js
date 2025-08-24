'use server';

import { withAuth } from '@/lib/with-auth';
import { SignInForm } from './signin-form';

const PageLogin = async () => {
  const isGoogle = (process?.env?.GOOGLE_ID && process?.env?.GOOGLE_SECRET) ? true : false;
  const isGithub = (process?.env?.GITHUB_ID && process?.env?.GITHUB_SECRET) ? true : false;
  const isKeycloak = (process?.env?.KEYCLOAK_ID && process?.env?.KEYCLOAK_SECRET && process?.env?.KEYCLOAK_ISSUER) ? true : false;
  const isAuthentik = (process?.env?.AUTHENTIK_ID && process?.env?.AUTHENTIK_SECRET && process?.env?.AUTHENTIK_ISSUER) ? true : false;

  return (
    <div className='flex flex-col grow justify-center items-center w-full'>
      <SignInForm
        isGithub={ isGithub }
        isGoogle={ isGoogle }
        isKeycloak={ isKeycloak }
        isAuthentik={ isAuthentik }
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
