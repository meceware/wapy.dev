'use client';

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createAuthClient } from 'better-auth/react';
import { magicLinkClient } from 'better-auth/client/plugins';
import { emailOTPClient } from 'better-auth/client/plugins';
import { genericOAuthClient } from 'better-auth/client/plugins';

const authClient = createAuthClient({
  plugins: [
    magicLinkClient(),
    emailOTPClient(),
    genericOAuthClient(),
  ]
});

const AuthContext = createContext(null);

export const AuthProvider = ({ children, initialSession = null }) => {
  const router = useRouter();
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const {data: clientSession, isPending, isRefetching, refetch} = authClient.useSession();
  const {signIn} = authClient;

  // Track when initial client fetch completes
  useEffect(() => {
    if (!isPending && !hasInitiallyLoaded) {
      setHasInitiallyLoaded(true);
    }
  }, [isPending, hasInitiallyLoaded]);

  // Resolve current session
  const currentSession = hasInitiallyLoaded
    ? clientSession?.session ?? null
    : initialSession;

  // Compute derived states
  const isLoading = isPending || isRefetching;
  const isAuthenticated = !!currentSession?.id;

  // Session getter function (privacy-first)
  const getSession = useCallback(() => currentSession, [currentSession]);

  const signOut = useCallback(async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/login');
        },
      },
    });
  }, [router]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      isLoading,
      isAuthenticated,
      getSession,
      signIn,
      signOut,
      refetch,
    }),
    [isLoading, isAuthenticated, getSession, signIn, signOut, refetch]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
