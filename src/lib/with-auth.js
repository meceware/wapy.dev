import { redirect } from 'next/navigation';
import { useAuthServer } from '@/lib/auth-server';

export function withAuth(WrappedComponent, isProtected = true, isRedirected = true) {
  return async (props) => {
    const { isAuthenticated, isBlocked, signOut } = await useAuthServer();

    if (isBlocked()) {
      await signOut();
      redirect('/');
    }

    if (isProtected && !isAuthenticated()) {
      if (isRedirected) {
        redirect('/login');
      }
      return null;
    }

    if (!isProtected && isAuthenticated()) {
      if (isRedirected) {
        redirect('/');
      }
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
