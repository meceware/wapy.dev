import { headers } from 'next/headers';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { magicLink, emailOTP, genericOAuth } from 'better-auth/plugins';
import { prisma } from '@/lib/prisma';
import { siteConfig } from '@/components/config';
import { mailFrom, mailSend } from '@/lib/mail';

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

export const auth = betterAuth({
  appName: siteConfig.name,
  baseURL: siteConfig.url,
  secret: process.env.AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? { github: {
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
        disableSignUp: process?.env?.DISABLE_USER_REGISTRATION === 'true'
      } }
      : {}
    ),
    ...(process.env.GOOGLE_ID && process.env.GOOGLE_SECRET
      ? { google: {
        clientId: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET,
        disableSignUp: process?.env?.DISABLE_USER_REGISTRATION === 'true'
      } }
      : {}
    ),
  },
  user: {
    additionalFields: {
			isBlocked: {
        type: "boolean",
        required: false,
      },
			webhook: {
        type: "string",
        required: false,
      },
		},
  },
  account: {
    encryptOAuthTokens: true,
  },
  session: {
    // 14 days
    expiresIn: 60 * 60 * 24 * 14,
    // 1 day
    updateAge: 60 * 60 * 24,
  },
  plugins: [
    nextCookies(),
    magicLink( {
      disableSignUp: process?.env?.DISABLE_USER_REGISTRATION === 'true',
      expiresIn: 2 * 60 * 60, // 2 hours
      sendMagicLink: async ({ email, token, url }, request) => {
        const otp = await auth.api.createVerificationOTP({
          body: {
            email: email,
            type: 'sign-in',
          },
        });

        await mailSend({
          from: `${siteConfig.from} <${mailFrom}>`,
          to: email,
          subject: `Sign in to ${siteConfig.name}`,
          html: html({ url, token: otp }),
          text: text({ url, token: otp }),
        });
      }
    } ),
    emailOTP({
      disableSignUp: process?.env?.DISABLE_USER_REGISTRATION === 'true',
      expiresIn: 20 * 60, // 20 minutes
      async sendVerificationOTP({ email, otp, type }) {
        return;
      },
    }),
    ...(process.env.GENERIC_AUTH_PROVIDER && process.env.GENERIC_AUTH_CLIENT_ID && process.env.GENERIC_AUTH_CLIENT_SECRET && process.env.GENERIC_AUTH_ISSUER
      ? [genericOAuth({
        config: [ {
          providerId: process.env.GENERIC_AUTH_PROVIDER,
          clientId: process.env.GENERIC_AUTH_CLIENT_ID,
          clientSecret: process.env.GENERIC_AUTH_CLIENT_SECRET,
          discoveryUrl: process.env.GENERIC_AUTH_ISSUER,
      } ],
      })]
      : []
    ),
  ],
  advanced: {
    cookiePrefix: 'wapy-dev',
    database: {
      generateId: false
    },
  },
  logger: {
    level: 'warn',
  },
});
