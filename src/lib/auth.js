import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import Resend from 'next-auth/providers/resend';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { siteConfig } from '@/components/config';

const authURL = new URL(process.env.AUTH_URL);
const cookiePrefix = authURL.protocol === 'https:' ? '__Secure-' : '';
const authDomain = authURL.hostname === 'localhost' ? authURL.hostname : `.${authURL.hostname.split('.').slice(-2).join('.')}`;

const html = ({ url }) => {
  return `
    <body style="margin: 0; padding: 0; background-color: #efefef;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; border: 0;">
        <tr>
          <td align="center" style="padding: 1rem 2rem;">
            <table role="presentation" style="max-width: 600px; border-collapse: collapse; border: 0; text-align: left;">
              <tr>
                <td style="padding-top: 40px;">
                  <div style="text-align: center;">
                    <div style="padding-bottom: 20px;">
                      <img src="${siteConfig.url}/icon.png" alt="${process.env.RESEND_NAME}" style="width: 96px;">
                    </div>
                  </div>
                  <div style="padding: 20px; background-color: #ffffff;">
                    <div style="color: #000000; text-align: left;">
                      <h1 style="margin: 1rem 0">Sign in to ${process.env.RESEND_NAME}</h1>
                      <p style="padding-bottom: 16px">Click the link below to sign in.</p>
                      <p style="padding-bottom: 16px">
                        <a href="${url}" target="_blank" style="padding: 12px 24px; border-radius: 4px; color: #FFF; background: #2B52F5; display: inline-block; margin: 0.5rem 0; text-decoration: none;">
                          Sign in to your account
                        </a>
                      </p>
                      <p style="padding-bottom: 16px">If you didn't ask to sign in, you can ignore this email.</p>
                      <p style="padding-bottom: 16px">Thanks,<br>${process.env.RESEND_NAME}</p>
                    </div>
                  </div>
                  <div style="padding-top: 20px; color: #999999; text-align: center;">
                    <p style="padding-bottom: 16px">Made with ♥ by <a href="${siteConfig.url}" target="_blank">${siteConfig.name}</a></p>
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

const text = ({ url }) => {
  return `Sign in to ${process.env.RESEND_NAME}\n${url}\n\n`;
};

const authConfig = {
  adapter: PrismaAdapter(prisma),
  theme: { logo: `${siteConfig.url}/icon.png` },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: `${process.env.RESEND_NAME} <${process.env.RESEND_FROM}>`,
      name: process.env.RESEND_NAME,
      sendVerificationRequest: async (params) => {
        const { identifier: to, provider, url, theme } = params;
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
            html: html({ url }),
            text: text({ url }),
          }),
        })

        if (!res.ok)
          throw new Error('Resend error: ' + JSON.stringify(await res.json()))
      },
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
  cookies: {
    pkceCodeVerifier: {
      name: `${cookiePrefix}authjs.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: 'none',
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
      }
    }
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);