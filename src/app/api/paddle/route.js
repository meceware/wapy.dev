'use server';

import { NextResponse } from 'next/server';
import { EventName } from '@paddle/paddle-node-sdk';
import { subHours } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { paddleGetInstance, paddleGetLatestSubscription } from '@/lib/paddle/actions';
import { M_PLUS_1 } from 'next/font/google';

const paddleUpdateSubscriptionData = async (eventData) => {
  if (!eventData?.eventId) {
    console.warn('Missing eventId', eventData);
    return;
  }

  if (!eventData?.data?.customerId) {
    console.warn('paddleUpdateSubscriptionData: Missing customerId', eventData);
    return false;
  }

  if (!eventData?.data?.id) {
    console.warn('paddleUpdateSubscriptionData: Missing subscription id', eventData);
    return false;
  }

  if (!eventData?.data?.status) {
    console.warn('paddleUpdateSubscriptionData: Missing subscription status', eventData);
    return false;
  }

  if (eventData.data.status !== 'active') {
    const paddleSubscription = await paddleGetLatestSubscription(eventData.data.customerId);
    if (paddleSubscription) {
      eventData.data.id = paddleSubscription.id;
      eventData.data.status = paddleSubscription.status;
      eventData.data.currentBillingPeriod = paddleSubscription.currentBillingPeriod;
      eventData.data.subScheduledChange = paddleSubscription.subScheduledChange;
    }
  }

  const paddleUserDetails = await prisma.paddleUserDetails.update({
    where: {
      customerId: eventData.data.customerId,
    },
    data: {
      subId: eventData.data.id,
      subStatus: eventData.data.status,
      subStartedAt: eventData.data.currentBillingPeriod?.startsAt,
      subNextPaymentAt: eventData.data.currentBillingPeriod?.endsAt,
      subScheduledChange: eventData.data.scheduledChange,
    }
  });

  await prisma.user.update({
    where: {
      id: paddleUserDetails.userId,
    },
    data: {
      subNextNotification: eventData.data?.currentBillingPeriod?.endsAt ? subHours(new Date(eventData.data.currentBillingPeriod?.endsAt), 1) : null,
    }
  });

  // ? canceled_at: null,
  // ? paused_at: null,
  // ? scheduled_change: null,
  // ? current_billing_period: {
  //     ends_at: 2024-05-12T10:18:47.635628Z,
  //     starts_at: 2024-04-12T10:18:47.635628Z
  // }

  return paddleUserDetails ? true : false;
}

const paddleUpdateCustomerData = async (eventData) => {
  if (!eventData?.eventId) {
    console.warn('paddleUpdateCustomerData: Missing eventId', eventData);
    return false;
  }

  if (!eventData?.data?.email) {
    console.warn('paddleUpdateCustomerData: Missing email', eventData);
    return false;
  }

  if (!eventData?.data?.id) {
    console.warn('paddleUpdateCustomerData: Missing customer id', eventData);
    return false;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: eventData.data.email,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    console.warn('paddleUpdateCustomerData: User not found', eventData);
    return false;
  }

  const customerId = eventData.data.id;
  const marketingConsent = eventData.data?.marketingConsent ?? false;
  const customerStatus = eventData.data?.status ?? 'none';
  const paddleUserDetails = await prisma.paddleUserDetails.upsert({
    where: {
      userId: user.id,
    },
    create: {
      userId: user.id,
      customerId: customerId,
      marketingConsent: marketingConsent,
      customerStatus: customerStatus,
    },
    update: {
      customerId: customerId,
      marketingConsent: marketingConsent,
      customerStatus: customerStatus,
    }
  });

  return paddleUserDetails ? true : false;
}

const paddleHandleWebhook = async (request) => {
  const paddle = await paddleGetInstance();
  if (!paddle) {
    return NextResponse.json({ error: 'Paddle is not configured.' }, { status: 500 });
  }

  const privateKey = process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET;
  if (!privateKey) {
    console.warn('Missing webhook secret');
    return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
  }

  try {
    const rawBody = await request.text();
    const signature = request.headers.get('paddle-signature');

    if (!signature || !rawBody) {
      console.warn('Missing signature');
      return NextResponse.json({ error: 'Configuration error' }, { status: 401 });
    }

    const eventData = await paddle.webhooks.unmarshal(rawBody, privateKey, signature);

    if (!eventData) {
      console.warn('Invalid Paddle webhook data');
      return NextResponse.json({ error: 'Configuration error' }, { status: 400 });
    }

    switch (eventData.eventType) {
      case EventName.SubscriptionActivated:
      case EventName.SubscriptionCanceled:
      case EventName.SubscriptionCreated:
      case EventName.SubscriptionPastDue:
      case EventName.SubscriptionPaused:
      case EventName.SubscriptionResumed:
      case EventName.SubscriptionTrialing:
      case EventName.SubscriptionUpdated:
        await paddleUpdateSubscriptionData(eventData);
        break;
      case EventName.CustomerCreated:
      case EventName.CustomerUpdated:
        await paddleUpdateCustomerData(eventData);
        break;
      default:
        console.warn('Unhandled Paddle webhook event:', eventData.eventType);
        break;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.warn('Error handling Paddle webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  return paddleHandleWebhook(request);
}

// export async function GET(request) {
//   return paddleHandleWebhook(request);
// }