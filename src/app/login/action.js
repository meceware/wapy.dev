'use server';

import { createHmac } from 'crypto';
import { signIn } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { signInSchema, signInOTPSchema } from './schema';
import { siteConfig } from '@/components/config';

export const signInAction = async (data) => {
  if (!data || !data?.email) {
    return null;
  }

  const parsedData = signInSchema.safeParse(data);
  if (!parsedData?.success) {
    return null;
  }

  return await signIn('resend', { email: parsedData.data.email, redirect: false, redirectTo : '/' });
}

export const generateOTPLink = async (code, email) => {
  const parsedCode = signInOTPSchema.safeParse({ code: code });
  const parsedEmail = signInSchema.safeParse({ email: email });

  if (!parsedCode?.success || !parsedEmail?.success) {
    return null;
  }

  const hashed = createHmac('sha256', process.env.AUTH_SECRET).update(`${email}-${code}`).digest('hex');

  // Cleanup
  await prisma.verificationOTPToken.deleteMany({
    where: {
      expires: {
        lt: new Date(),
      },
    },
  });

  // Find token entry
  const tokenEntry = await prisma.verificationOTPToken.findFirst({
    where: {
      identifier: parsedEmail.data.email,
      code: hashed,
      expires: {
        gt: new Date(),
      },
    },
  });

  if (!tokenEntry?.id) {
    return null;
  }

  await prisma.verificationOTPToken.delete({
    where: {
      id: tokenEntry.id,
    },
  });

  const params = {
    callbackUrl: siteConfig.url,
    token: tokenEntry.token,
    email: parsedEmail.data.email,
  };
  return `/api/auth/callback/resend?${new URLSearchParams(params).toString()}`;
}
