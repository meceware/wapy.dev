'use server';

import { auth } from '@/lib/auth';
import webpush from 'web-push';
import { prisma } from '@/lib/prisma';
import { mailFrom, mailSend } from '@/lib/mail';
import { siteConfig } from '@/components/config';

export const UserSubscriptionSendNotification = async (subscription, title, message, markAsPaidUrl, isPaymentDueNow) => {
  return subscription.user.push.map(async push => {
    return new Promise(async (resolve, reject) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: push.endpoint,
            keys: {
              p256dh: push.p256dh,
              auth: push.auth
            }
          },
          JSON.stringify({
            title: title,
            body: message,
            url: siteConfig.url,
            color: isPaymentDueNow ? '#f59e0b' : '#16a34a',
            icon: {
              main: '/icons/icon-192.png',
              badge: isPaymentDueNow ? '/icons/icon-notification-now.png' : '/icons/icon-notification-upcoming.png',
            },
            markAsPaid: {
              title: 'Mark as Paid',
              icon: '/icons/icon-notification-mark-as-paid.png',
              url: markAsPaidUrl,
            },
            dismiss: {
              title: 'Dismiss',
              icon: '/icons/icon-notification-dismiss.png',
            },
          }),
          {
            vapidDetails: {
              subject: `mailto:${mailFrom}`,
              publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
              privateKey: process.env.VAPID_PRIVATE_KEY
            },
          }
        );
        resolve();
      } catch (error) {
        if (error.statusCode === 410) {
          // Subscription has expired or is no longer valid
          await prisma.pushSubscription.delete({
            where: {
              id: push.id,
            }
          });
          resolve();
        } else {
          console.warn('Error sending notification:', error);
          reject(error);
        }
      }
    });
  });
}

export const UserSubscriptionSendTestNotification = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      push: {
        select: {
          id: true,
          endpoint: true,
          p256dh: true,
          auth: true,
        }
      },
    },
  });

  if (!user || !user.push) {
    return { success: false };
  }

  try {
  const promises = await UserSubscriptionSendNotification(
      { user: user },
      'Wapy.dev Test Notification',
      'This is a test notification from Wapy.dev. If you are seeing this, it means push notifications are working correctly!',
      '',
      true
    );

    const results = await Promise.allSettled(promises);
    return { success: results.some(r => r.status === 'fulfilled') };
  } catch (e) {
    // If something unexpected throws, return failure
    console.warn('Test notification failed:', e);
    return { success: false };
  }
}

export const UserSubscriptionSendEmail = async (subscription, title, message, markAsPaidUrl) => {
  return new Promise(async (resolve, reject) => {
    try {
      await mailSend({
        from: `Wapy.dev Subscription Reminder <${mailFrom}>`,
        to: subscription.user.email,
        subject: title,
        html: `
          <body style="margin: 0; padding: 0; background-color: #efefef;">
            <table role="presentation" style="width: 100%; border-collapse: collapse; border: 0;">
              <tr>
                <td align="center" style="padding: 1rem 2rem;">
                  <div style="max-width: 400px; background-color: #ffffff; padding: 1rem; text-align: left;">
                    <h2 style="margin: 1rem 0; color: #000000;">Payment Reminder</h2>
                    <p>${message}</p>
                    <p>
                      <a href="${markAsPaidUrl}">Mark as Paid!</a>
                      <span style="margin: 0 0.1rem;">|</span>
                      <a href="${siteConfig.url}/">View Details</a>
                    </p>
                    <p>This is a friendly reminder email from ${siteConfig.name}.</p>
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
        `,
        text: `${title}\n\n${message}\n\nThis is a friendly reminder email from ${siteConfig.name}.\n\nView details at: ${siteConfig.url}/\n\nThanks,\n${siteConfig.name}`,
      });
      resolve();
    } catch (error) {
      console.warn('Error sending email:', error);
      reject(error);
    }
  });
};