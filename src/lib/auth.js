import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import Resend from 'next-auth/providers/resend';
import { createHmac } from 'crypto';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { siteConfig } from '@/components/config';

const authURL = new URL(`${siteConfig.url}/api/auth`);
const cookiePrefix = authURL?.protocol === 'https:' ? '__Secure-' : '';
const authDomain = authURL?.hostname ? (authURL.hostname === 'localhost' ? authURL.hostname : `.${authURL.hostname.split('.').slice(-2).join('.')}`) : '';

const html = ({ url, token }) => {
  return `
    <body style="margin: 0; padding: 0; background-color: #efefef;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; border: 0;">
        <tr>
          <td align="center" style="padding: 1rem 2rem;">
            <table role="presentation" style="max-width: 600px; border-collapse: collapse; border: 0; text-align: left;">
              <tr>
                <td style="padding-top: 40px;">
                  <div style="text-align: center;">
                    <img src="${siteConfig.url}/icon.png" alt="${siteConfig.from}" style="width: 96px; padding-bottom: 20px;">
                  </div>
                  <div style="padding: 20px; background-color: #ffffff;">
                    <h1 style="margin: 1rem 0 0 0; color: #000000; text-align: center;">Sign in to</h1>
                    <h2 style="margin: 0 0 1rem 0; color: #000000; text-align: center;">${siteConfig.name}</h2>
                    <div style="margin: 24px 0; text-align: center;">
                      <p>Click the link below to sign in.</p>
                      <p>
                        <a href="${url}" target="_blank" style="padding: 12px 24px; border-radius: 4px; color: #FFF; background: #16A34A; display: inline-block; margin: 0.5rem 0; text-decoration: none;">
                          Sign in to your account
                        </a>
                      </p>
                    </div>
                    <p style="text-align: center;">- OR -</p>
                    <div style="margin: 24px 0; text-align: center;">
                      <p>Use this code to sign in:</p>
                      <div style="font-size: 24px; font-weight: bold; letter-spacing: 8px; padding: 16px; background: #f3f4f6; border-radius: 8px;">
                        ${token}
                      </div>
                    </div>
                    <p style="padding-bottom: 16px;">If you didn't ask to sign in, you can ignore this email.</p>
                    <p style="padding-bottom: 16px;">Thanks,<br>${siteConfig.from}</p>
                  </div>
                  <div style="padding-top: 20px; color: #999999; text-align: center;">
                    <p style="padding-bottom: 16px;">Made with ♥ by <a href="${siteConfig.url}" target="_blank">${siteConfig.name}</a></p>
                  </div>
                </td>
              </tr>
            </table>
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
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: `${siteConfig.from} <${process.env.RESEND_FROM}>`,
      name: siteConfig.from,
      maxAge: 60 * 60 * 4, // 4 hours
      sendVerificationRequest: async (params) => {
        const { identifier: to, provider, url, token, expires } = params;

        const otp = await generateOTP(to, token, expires);
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${provider.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: provider.from,
            to,
            subject: `Sign in to ${siteConfig.name}`,
            html: html({ url, token: otp }),
            text: text({ url, token: otp }),
          }),
        });

        if (!res.ok)
          throw new Error('Resend error: ' + JSON.stringify(await res.json()));
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
  },
  cookies: {
    pkceCodeVerifier: {
      name: `${cookiePrefix}authjs.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
        maxAge: 900,
        domain: authDomain,
      },
    },
    sessionToken: {
      name: `${cookiePrefix}authjs.session-token`,
      options: {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        domain: authDomain,
      },
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);