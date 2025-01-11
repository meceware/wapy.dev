'use server';

import { NextResponse } from 'next/server';
import webpush from 'web-push';
import jsonwebtoken from 'jsonwebtoken';
import { formatDistanceToNowStrict } from 'date-fns';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { SubscriptionGetNextNotificationDate } from '@/components/subscriptions/lib';
import { DefaultCurrencies } from '@/config/currencies';
import { siteConfig } from '@/components/config';

const sendNotification = async (subscription, title, message, markAsPaidUrl, WebPush) => {
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
            url: markAsPaidUrl,
            icon: {
              main: '/icons/icon-192.png',
              badge: '/icons/icon-96.png'
            },
            markAsPaid: {
              title: 'Mark as Paid',
              icon: '/icon-mark-as-paid.png',
              url: markAsPaidUrl,
            },
            home: {
              title: 'Home',
              icon: '/icon-home.png',
              url: siteConfig.url,
            },
          },
          {
            vapidDetails: {
              subject: `mailto:Wapy Subscription Reminder <${process.env.RESEND_FROM}>`,
              publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
              privateKey: process.env.VAPID_PRIVATE_KEY
            }
          })
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
          console.error('Error sending notification:', error);
          reject(error);
        }
      }
    });
  });
}

const sendEmail = async (subscription, title, message, markAsPaidUrl) => {
  return new Promise(async (resolve, reject) => {
    try {
      await new Resend(process.env.RESEND_API_KEY).emails.send({
        from: `mailto:Wapy Subscription Reminder <${process.env.RESEND_FROM}>`,
        to: subscription.user.email,
        subject: title,
        html: `
          <p>${message}</p>
          <p>This is a friendly reminder email from wapy.dev.</p>
          <p>
            <a href="${siteConfig.url}/">View Details</a> |
            <a href="${markAsPaidUrl}">Mark as Paid</a>
          </p>
        `,
      });
      resolve();
    } catch (error) {
      console.error('Error sending email:', error);
      reject(error);
    }
  });
};

export async function GET() {
  const formatPrice = (price, curr) => {
    const currency = DefaultCurrencies[curr];
    return currency.position === 'before'
      ? `${currency.symbol}${price}`
      : `${price}${currency.symbol}`;
  };

  const rightNow = new Date();
  const subscriptions = await prisma.subscription.findMany({
    where: {
      enabled: true,
      nextNotificationTime: {
        not: null,
        lte: rightNow,
      },
    },
    include: {
      user: {
        include: {
          push: true
        }
      }
    }
  });

  const startTime = performance.now();
  const promises = [];
  for (const subscription of subscriptions) {
    const notificationTypes = subscription?.nextNotificationDetails?.type && Array.isArray(subscription?.nextNotificationDetails?.type)
      ? subscription.nextNotificationDetails.type
      : [];
    const isPushEnabled = notificationTypes.includes('PUSH');
    const isEmailEnabled = notificationTypes.includes('EMAIL');

    const paymentDate = subscription.nextNotificationDetails?.paymentDate;
    const isPaymentDueNow = paymentDate === subscription.nextNotificationTime;
    const dueText = isPaymentDueNow
      ? 'due now'
      : `${formatDistanceToNowStrict(paymentDate, {addSuffix: true})}`;
    const title = isPaymentDueNow
      ? 'Payment Due'
      : 'Upcoming Payment'
      + ` for '${subscription.name}'`;
    const message = `Your '${subscription.name}' subscription payment (${formatPrice(subscription.price, subscription.currency)}) is ${dueText}!`;

    const token = jsonwebtoken.sign({
      id: subscription.id,
      userId: subscription.userId,
    }, process.env.SUBSCRIPTION_JWT_SECRET);
    const markAsPaidUrl = `${siteConfig.url}/api/mark-as-paid/?token=${token}`;

    // Send push notification if enabled
    if (isPushEnabled) {
      promises.push(sendNotification(subscription, title, message, markAsPaidUrl));
    }

    // Send email notification if enabled
    if (isEmailEnabled) {
      promises.push(sendEmail(subscription, title, message, markAsPaidUrl));
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

  await Promise.all(promises);
  const endTime = performance.now();
  if ((endTime - startTime) > 1000) {
    console.log(`Notifications sent in ${endTime - startTime}ms`);
  }

  return NextResponse.json({ success: true });
}