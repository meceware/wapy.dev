'use server';

import { Environment, LogLevel, Paddle } from '@paddle/paddle-node-sdk';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const paddleGetInstance = async () => {
  if (!process.env.PADDLE_API_KEY) {
    return null;
  }

  return new Paddle(process.env.PADDLE_API_KEY ?? '', {
    environment: process.env.NEXT_PUBLIC_PADDLE_ENV ?? Environment.sandbox,
    logLevel: LogLevel.warn,
  });
};

const paddleGetCustomerId = async (userId) => {
  if (!userId) {
    const session = await auth();
    if (!session?.user?.id) {
      return false;
    }
    userId = session.user.id;
  }

  const customer = await prisma.paddleUserDetails.findUnique({
    where: {
      userId: userId,
    },
  });

  return customer?.customerId;
}

// Paddle create customer:
// await paddle.customers.create({ email: user.email });

export const paddleGetCustomer = async (userId) => {
  if (!userId) {
    return null;
  }

  try {
    const paddle = await paddleGetInstance();
    if (!paddle) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        paddleUserDetails: true,
      },
    });

    // Check if customer exists
    const customerCollection = await paddle.customers.list({
      email: [ user.email ],
    });
    const customers = await customerCollection.next();

    return {
      data: customers,
      hasMore: customerCollection.hasMore,
      totalRecords: customerCollection.estimatedTotal,
    };
  } catch (e) {
    console.warn('paddleGetSubscription error', e, e.errors);
  }

  return false;
}

export const paddleGetSubscriptions = async (customerId) => {
  if (!customerId) {
    customerId = await paddleGetCustomerId();
    if (!customerId) {
      return null;
    }
  }

  try {
    const paddle = await paddleGetInstance();
    if (!paddle) {
      return null;
    }

    const subscriptionCollection = await paddle.subscriptions.list({ customerId: [customerId] });
    const subscriptions = await subscriptionCollection.next();
    return {
      data: subscriptions ? subscriptions : [],
      hasMore: subscriptionCollection.hasMore,
      totalRecords: subscriptionCollection.estimatedTotal,
    };
  } catch (e) {
    console.warn('paddleGetSubscription error', e, e.errors);
  }

  return false;
}

export const paddleGetLatestSubscription = async (customerId) => {
  const subscriptions = await paddleGetSubscriptions(customerId);
  if (!subscriptions) {
    return null;
  }

  if (!subscriptions.data || !subscriptions.data.length) {
    return null;
  }

  // Filter active subscriptions
  const activeSubscriptions = subscriptions.data.filter(sub => sub.status === 'active');

  if (!activeSubscriptions.length) {
    return null;
  }

  // Sort by currentBillingPeriod.endsAt in descending order
  // Handle null values by placing them at the end
  const sortedSubscriptions = activeSubscriptions.sort((a, b) => {
    const aEndsAt = a.currentBillingPeriod?.endsAt;
    const bEndsAt = b.currentBillingPeriod?.endsAt;

    if (!aEndsAt && !bEndsAt) return 0;
    if (!aEndsAt) return 1;
    if (!bEndsAt) return -1;

    return new Date(bEndsAt) - new Date(aEndsAt);
  });

  return sortedSubscriptions[0];
}

export const paddleCheckSubscriptionCheckout = async (customerId, maxAttempts = 20) => {
  if (!customerId) {
    return false;
  }

  // Function to check if subscription data has been updated
  const checkUpdate = async () => {
    const userDetails = await prisma.paddleUserDetails.findUnique({
      where: {
        customerId: customerId,
      },
      select: {
        subId: true,
        subStatus: true,
        updatedAt: true,
      },
    });

    if (!userDetails) {
      return false;
    }

    return userDetails.subId && userDetails.subStatus !== 'none';
  };

  // Poll for updates
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const isUpdated = await checkUpdate();
    if (isUpdated) {
      revalidatePath('/account');
      return true;
    }
    // Wait 1 second before next attempt
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  // If we reach here, the update wasn't detected within the timeout period
  revalidatePath('/account');
  return false;
};

export const paddleCancelSubscription = async (subscriptionId) => {
  if (!subscriptionId) {
    return null;
  }

  try {
    const paddle = await paddleGetInstance();
    if (!paddle) {
      return null;
    }

    const subscription = await paddle.subscriptions.cancel(subscriptionId, {
      effectiveFrom: 'next_billing_period'
    });

    if (!subscription || !subscription?.id) {
      return null;
    }

    const maxAttempts = 12; // 1 minute total (12 * 5 seconds)
    const checkUpdate = async () => {
      const userDetails = await prisma.paddleUserDetails.findFirst({
        where: {
          subId: subscription.id,
        },
        select: {
          subScheduledChange: true,
        },
      });

      if (!userDetails) {
        return true;
      }

      return userDetails.subScheduledChange?.action === 'cancel';
    };

    // Poll for updates
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const isUpdated = await checkUpdate();
      if (isUpdated) {
        revalidatePath('/account');
        return true;
      }
      // Wait 5 seconds before next attempt
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // If we reach here, the update wasn't detected within the timeout period
    revalidatePath('/account');
  } catch (e) {
    console.warn('Error canceling subscription', e);
    return { error: 'Something went wrong, please try again later' };
  }

  return false;
};

export const paddleResumeSubscription = async (subscriptionId) => {
  if (!subscriptionId) {
    return null;
  }

  try {
    const paddle = await paddleGetInstance();
    if (!paddle) {
      return null;
    }

    const subscription = await paddle.subscriptions.resume(subscriptionId);

    if (!subscription || !subscription?.id) {
      return null;
    }

    const maxAttempts = 12; // 1 minute total (12 * 5 seconds)
    const checkUpdate = async () => {
      const userDetails = await prisma.paddleUserDetails.findFirst({
        where: {
          subId: subscription.id,
        },
        select: {
          subStatus: true,
        },
      });

      if (!userDetails) {
        return true;
      }

      return userDetails.subStatus === 'active';
    };

    // Poll for updates
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const isUpdated = await checkUpdate();
      if (isUpdated) {
        revalidatePath('/account');
        return true;
      }
      // Wait 5 seconds before next attempt
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // If we reach here, the update wasn't detected within the timeout period
    revalidatePath('/account');
  } catch (e) {
    console.warn('Error resuming subscription', e);
    return { error: 'Something went wrong, please try again later' };
  }

  return false;
};
