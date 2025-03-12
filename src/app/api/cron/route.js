'use server';

import { NextResponse } from 'next/server';
import webpush from 'web-push';
import jsonwebtoken from 'jsonwebtoken';
import { formatDistanceToNowStrict, isEqual, addDays, addMonths, isAfter, isPast } from 'date-fns';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { SubscriptionGetNextNotificationDate } from '@/components/subscriptions/lib';
import { siteConfig } from '@/components/config';
import { paddleGetStatus } from '@/lib/paddle/status';
import { PADDLE_STATUS_MAP, TRIAL_DURATION_MONTHS, paddleIsValid } from '@/lib/paddle/enum';
import { formatPrice } from '@/components/subscriptions/utils';

const sendNotification = async (subscription, title, message, markAsPaidUrl, isPaymentDueNow) => {
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
              subject: `mailto:Wapy.dev Subscription Reminder <${process.env.RESEND_FROM}>`,
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

const sendEmail = async (subscription, title, message, markAsPaidUrl, resend) => {
  return new Promise(async (resolve, reject) => {
    try {
      await resend.emails.send({
        from: `Wapy.dev Subscription Reminder <${process.env.RESEND_FROM}>`,
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

const UserSubscriptionNotifications = async (resend, rightNow) => {
  if (!process.env.PADDLE_API_KEY) {
    return;
  }

  const users = await prisma.user.findMany({
    where: {
      isBlocked: false,
      fullAccess: false,
      subNextNotification: {
        not: null,
        lte: rightNow,
      },
    },
    include: {
      push: true,
      paddleUserDetails: true,
    },
  });

  const startTime = performance.now();
  const promises = [];
  for (const user of users) {
    const paddleStatus = await paddleGetStatus(user);
    if (paddleStatus.status === PADDLE_STATUS_MAP.none) {
      continue;
    }

    const nextNotificationDate = user.subNextNotification;
    const pastNotificationData = {
      userId: user.id,
      title: '',
      message: '',
      type: 'PAYMENT_DUE',
      subscriptionId: null,
    }

    if (paddleStatus.status === PADDLE_STATUS_MAP.trialActive) {
      const paymentDate = addMonths(user.trialStartedAt, TRIAL_DURATION_MONTHS);

      pastNotificationData.title = 'Wapy.dev Trial Reminder';
      pastNotificationData.message = `Your Wapy.dev trial period is ending soon. Subscribe now to keep enjoying all features.`;

      // Send push notification for trial active
      promises.push(sendNotification(
        {user: user},
        pastNotificationData.title,
        pastNotificationData.message,
        `${siteConfig.url}/account`,
        false
      ));

      // Set next notification date to current + 1 day
      const nextDate = addDays(nextNotificationDate, 1);
      promises.push(
        prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            subNextNotification: isPast(paymentDate) && isPast(nextDate) ? null :
              isPast(paymentDate) ? nextDate :
              isPast(nextDate) ? paymentDate :
              isAfter(paymentDate, nextDate) ? paymentDate : nextDate,
          }
        })
      );
    } else if (paddleStatus.status === PADDLE_STATUS_MAP.trialExpired) {
      pastNotificationData.title = 'Wapy.dev Trial Expired';
      pastNotificationData.message = `Your Wapy.dev trial period is expired. Subscribe now to keep enjoying all features.`;

      // Send push notification for expired trial
      promises.push(sendNotification(
        {user: user},
        pastNotificationData.title,
        pastNotificationData.message,
        `${siteConfig.url}/account`,
        false
      ));

      // Send email notification
      promises.push(sendEmail(
        {user: user},
        pastNotificationData.title,
        pastNotificationData.message,
        `${siteConfig.url}/account`,
        resend
      ));

      // Set next notification to null
      promises.push(
        prisma.user.update({
          where: { id: user.id },
          data: { subNextNotification: null }
        })
      );
    } else {
      pastNotificationData.title = 'Wapy.dev Payment Reminder';
      pastNotificationData.message = `Just a reminder that your Wapy.dev subscription is ending soon.`;

      promises.push(sendNotification(
        {user: user},
        pastNotificationData.title,
        pastNotificationData.message,
        `${siteConfig.url}/account`,
        false
      ));

      promises.push(sendEmail(
        {user: user},
        pastNotificationData.title,
        pastNotificationData.message,
        `${siteConfig.url}/account`,
        resend
      ));

      promises.push(
        prisma.user.update({
          where: { id: user.id },
          data: { subNextNotification: null }
        })
      );
    }

    promises.push(prisma.pastNotification.create({
      data: pastNotificationData,
    }));
  }

  await Promise.allSettled(promises);
  const endTime = performance.now();
  if ((endTime - startTime) > 1000) {
    console.log(`User subscription notifications sent in ${endTime - startTime}ms`);
  }
}

export async function GET() {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const rightNow = new Date();

  await UserSubscriptionNotifications(resend, rightNow);

  const subscriptions = await prisma.subscription.findMany({
    where: {
      enabled: true,
      nextNotificationTime: {
        not: null,
        lte: rightNow,
      },
      user: {
        isBlocked: false,
      }
    },
    include: {
      user: {
        include: {
          push: true,
          paddleUserDetails: true,
        }
      }
    }
  });

  const startTime = performance.now();
  const promises = [];
  for (const subscription of subscriptions) {
    const paddleStatus = await paddleGetStatus(subscription.user);
    if (paddleStatus?.enabled && !paddleIsValid(paddleStatus?.status)) {
      continue;
    }

    const notificationTypes = subscription?.nextNotificationDetails?.type && Array.isArray(subscription?.nextNotificationDetails?.type)
      ? subscription.nextNotificationDetails.type
      : [];
    const isPushEnabled = notificationTypes.includes('PUSH');
    const isEmailEnabled = notificationTypes.includes('EMAIL');

    const paymentDate = subscription.nextNotificationDetails?.paymentDate;
    const isPaymentDueNow = isEqual(paymentDate, subscription.nextNotificationTime);
    const dueText = isPaymentDueNow
      ? 'due now'
      : `${formatDistanceToNowStrict(paymentDate, {addSuffix: true})}`;
    const title = (isPaymentDueNow ? 'Payment Due' : 'Upcoming Payment')
      + ` for '${subscription.name}'`;
    const message = `Your '${subscription.name}' subscription payment (${formatPrice(subscription.price, subscription.currency)}) is ${dueText}!`;

    const token = jsonwebtoken.sign({
      id: subscription.id,
      userId: subscription.userId,
      paymentDate: subscription.paymentDate,
    }, process.env.SUBSCRIPTION_JWT_SECRET);
    const markAsPaidUrl = `${siteConfig.url}/api/mark-as-paid/?token=${token}`;

    // Send push notification if enabled
    if (isPushEnabled) {
      promises.push(sendNotification(subscription, title, message, markAsPaidUrl, isPaymentDueNow));
    }

    // Send email notification if enabled
    if (isEmailEnabled) {
      promises.push(sendEmail(subscription, title, message, markAsPaidUrl, resend));
    }

    // Update subscription
    const nextNotificationDate = SubscriptionGetNextNotificationDate(subscription);
    promises.push(prisma.subscription.update({
      where: {
        id: subscription.id,
        userId: subscription.userId,
      },
      data: {
        nextNotificationTime: nextNotificationDate ? nextNotificationDate.date : null,
        nextNotificationDetails: nextNotificationDate ? nextNotificationDate.details : {},
      },
    }));

    promises.push(prisma.pastNotification.create({
      data: {
        userId: subscription.userId,
        title: title,
        message: message,
        type: 'PAYMENT_DUE',
        subscriptionId: subscription.id,
      },
    }));
  }

  await Promise.allSettled(promises);
  const endTime = performance.now();
  if ((endTime - startTime) > 1000) {
    console.log(`Notifications sent in ${endTime - startTime}ms`);
  }

  return NextResponse.json({ success: true });
}