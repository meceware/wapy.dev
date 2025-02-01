import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export function withAuth(WrappedComponent, isProtected = true, isRedirected = true) {
  return async function WithAuthWrapper(props) {
    const session = await auth();
    const isAuth = session && session?.user;

    if (isProtected && !isAuth) {
      if (isRedirected) {
        redirect('/login');
      }
      return null;
    }

    if (isAuth) {
      if (session?.user?.isBlocked) {
        redirect('/signout');
      }

      if (!isProtected) {
        if (isRedirected) {
          redirect('/');
        }
        return null;
      }
    }


    return <WrappedComponent {...props} />;
  };
}