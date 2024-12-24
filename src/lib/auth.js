import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import Resend from 'next-auth/providers/resend';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

const authConfig = {
  adapter: PrismaAdapter(prisma),
  theme: { logo: '/icon.png' },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.RESEND_FROM,
      name: process.env.RESEND_NAME,
      subject: 'Login to Wapy.dev',
    }),
  ],
  pages: {
    error: '/login',
    signIn: '/login',
    signOut: '/',
  },
  session:
  {
    strategy: 'database',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session?.user,
        id: user?.id,
      },
    }),
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);