'use server';

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function ProtectedRoute({ children, requireAuth }) {
  const session = await auth();

  if (requireAuth && !session) {
    redirect('/login');
  }

  if (!requireAuth && session) {
    redirect('/');
  }

  return children;
}