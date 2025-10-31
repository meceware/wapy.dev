'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { AuthProvider } from '@/lib/auth-client';

const authServerSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
};

export const useAuthServer = async () => {
  const session = await authServerSession();

  return {
    // Raw session access
    session,

    // User data helpers
    getUser: () => session?.user,
    getUserId: () => session?.user?.id,

    // Auth state checks
    isBlocked: () => session?.user?.isBlocked ?? false,

    // Actions
    signOut: async () => {
      if (!session) return null;
      return await auth.api.signOut({ headers: await headers() });
    },

    // Combined checks for common patterns
    isAuthenticated: () => {
      const user = session?.user;
      if (!user) return false;
      if (user.isBlocked) return false;
      return true;
    }
  };
};

export const AuthProviderServer = async ({ children }) => {
  const { session } = (await authServerSession()) || {};

  return (
    <AuthProvider initialSession={session}>
      {children}
    </AuthProvider>
  );
}