'use server';

import { signIn } from '@/lib/auth';
import { signInSchema } from './schema';

export async function signInAction(data) {
  if (!data || !data?.email) {
    return null;
  }

  const parsedData = signInSchema.safeParse(data);
  if (!parsedData?.success) {
    return null;
  }

  return await signIn('resend', { email: parsedData.data.email, redirect: false, redirectTo : '/' });
}