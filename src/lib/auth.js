import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import Nodemailer from 'next-auth/providers/nodemailer';
import { mailServerConfiguration, mailFrom, mailSend } from '@/lib/mail';
import { createHmac } from 'crypto';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { siteConfig } from '@/components/config';

const authURL = new URL(`${siteConfig.url}/api/auth`);
const authIsSecure = authURL?.protocol === 'https:';
const authCookiePrefix = authIsSecure ? '__Secure-' : '';

// Simple domain handling that works for all scenarios
const authDomain = (() => {
  if (!authURL?.hostname) return '';
  if (authURL.hostname === 'localhost') return authURL.hostname;

  // For IP addresses or non-standard domains, don't set a domain
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(authURL.hostname) || authURL.hostname.includes(':')) {
    return '';
  }

  // For standard domains, use the top-level domain approach
  return `.${authURL.hostname.split('.').slice(-2).join('.')}`;
})();

const html = ({ url, token }) => {
  return `
    <body style="margin: 0; padding: 0; background-color: #efefef;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; border: 0;">
        <tr>
          <td align="center" style="padding: 1rem 2rem;">
            <div style="padding: 1rem; background-color: #ffffff; text-align: center;">
              <h1 style="margin: 1rem 0 0 0; color: #000000;">Sign in to</h1>
              <h2 style="margin: 0 0 1rem 0; color: #000000;">${siteConfig.name}</h2>
              <div style="margin: 1rem 0;">
                <p>Click the link below to sign in.</p>
                <p>
                  <a href="${url}" target="_blank" style="padding: 0.75rem 1.25rem; border-radius: 0.25rem; color: #FFF; background: #16A34A; display: inline-block; margin: 0.5rem 0; text-decoration: none;">
                    Sign in to your account
                  </a>
                </p>
              </div>
              <p>- OR -</p>
              <div style="margin: 1rem 0;">
                <p>Use this code to sign in:</p>
                <div style="font-size: 1.5rem; font-weight: bold; letter-spacing: 0.5rem; padding: 1rem; background: #f3f4f6; border-radius: 0.5rem;">
                  ${token}
                </div>
              </div>
              <p>If you didn't ask to sign in, please ignore this email.</p>
              <p>Thanks,<br>${siteConfig.from}</p>
            </div>
            <div style="max-width: 400px; color: #999999; text-align: center;">
              <p style="padding-bottom: 0.5rem;">Made with ♥ by <a href="${siteConfig.url}" target="_blank">${siteConfig.name}</a></p>
              <div style="text-align: center;">
                <img src="${siteConfig.url}/icon.png" alt="${siteConfig.from}" style="width: 96px;">
              </div>
            </div>
          </td>
        </tr>
      </table>
    </body>
  `;
};

const text = ({ url, token }) => {
  return `Sign in to ${siteConfig.from}\n\nCopy and paste this link into your browser:\n${url}\n\nOr use this code to sign in: ${token}\n\nIf you didn't ask to sign in, you can ignore this email.\n\nThanks,\n${siteConfig.from}`;
};

const generateOTP = async (to, token, expires) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOTP = createHmac('sha256', process.env.AUTH_SECRET).update(`${to}-${otp}`).digest('hex');

  await prisma.verificationOTPToken.create({
    data: {
      identifier: to,
      code: hashedOTP,
      token: token,
      expires: expires,
    },
  });

  return otp;
};

const authConfig = {
  adapter: PrismaAdapter(prisma),
  theme: { logo: `${siteConfig.url}/icon.png` },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    Nodemailer({
      id: "wapy.dev.mailer",
      name: "Wapy.dev Mailer",
      server: { ...mailServerConfiguration },
      from: `${siteConfig.from} <${mailFrom}>`,
      name: siteConfig.from,
      maxAge: 60 * 60 * 2, // 2 hours
      sendVerificationRequest: async (params) => {
        const { identifier: to, provider, url, token, expires } = params;

        const otp = await generateOTP(to, token, expires);
        await mailSend({
          from: provider.from,
          to: to,
          subject: `Sign in to ${siteConfig.name}`,
          html: html({ url, token: otp }),
          text: text({ url, token: otp }),
        });
      },
    }),
  ],
  pages: {
    error: '/login',
    signIn: '/login',
    signOut: '/',
  },
  session: {
    strategy: 'database',
    maxAge: 60 * 60 * 24 * 60, // 60 days
  },
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session?.user,
        id: user?.id,
      },
    }),
    signIn: async ({ user }) => {
      if (user.isBlocked) {
        return false;
      }
      return true;
    },
  },
  cookies: {
    pkceCodeVerifier: {
      name: `${authCookiePrefix}authjs.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: authURL?.protocol === 'https:',
        maxAge: 900,
        ...(authDomain ? { domain: authDomain } : {}),
      },
    },
    sessionToken: {
      name: `${authCookiePrefix}authjs.session-token`,
      options: {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: authURL?.protocol === 'https:',
        ...(authDomain ? { domain: authDomain } : {}),
      },
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);