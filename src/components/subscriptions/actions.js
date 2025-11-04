'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { useAuthServer } from '@/lib/auth-server';
import {
  SchemaSubscriptionId,
  SchemaSubscriptionPrice,
  SchemaSubscriptionEdit,
} from '@/components/subscriptions/schema';
import { SubscriptionGetNextNotificationDate, SubscriptionGetNextPaymentDate } from '@/components/subscriptions/lib';
import { subYears } from 'date-fns';

export const SubscriptionGet = async (subscriptionId, userId) => {
  if (!subscriptionId) {
    return null;
  }

  const parsedData = SchemaSubscriptionId.safeParse({id: subscriptionId, userId: userId});
  if (!parsedData?.success || !parsedData?.data || parsedData?.data?.id !== subscriptionId || parsedData?.data?.userId !== userId) {
    return null;
  }

  const subscription = await prisma.subscription.findUnique({
    where: {
      id: subscriptionId,
      userId: userId,
    },
    include: {
      categories: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
      paymentMethods: {
        select: {
          id: true,
          name: true,
          icon: true,
        },
      },
    },
    omit: {
      userId: true,
    },
  });

  if (!subscription) {
    return null;
  }

  return subscription;
}

export const SubscriptionGetPastPaymentsStats = async (subscriptionId, userId) => {
  if (!subscriptionId) {
    return null;
  }

  const parsedData = SchemaSubscriptionId.safeParse({id: subscriptionId, userId: userId});
  if (!parsedData?.success || !parsedData?.data || parsedData?.data?.id !== subscriptionId || parsedData?.data?.userId !== userId) {
    return null;
  }

  const rightNow = new Date();
  const [total, thisYear, lastPayments] = (await Promise.allSettled([
    prisma.pastPayment.groupBy({
      by: [
        'currency'
      ],
      where: {
        subscriptionId: subscriptionId,
        userId: userId,
      },
      _count: {
        _all: true,
      },
      _sum: {
        price: true,
      },
    }),
    prisma.pastPayment.groupBy({
      by: [
        'currency'
      ],
      where: {
        subscriptionId: subscriptionId,
        paidAt: {
          gte: subYears(rightNow, 1),
          lt: rightNow,
        },
      },
      _count: {
        _all: true,
      },
      _sum: {
        price: true,
      },
    }),
    prisma.pastPayment.findMany({
      where: {
        subscriptionId: subscriptionId,
        userId: userId,
      },
      orderBy: {
        paidAt: 'desc'
      },
      take: 20,
      select: {
        price: true,
        currency: true,
        paymentDate: true,
        paidAt: true,
      },
    }),
  ])).map(r => r?.value);

  return {
    totalCount: total.reduce((sum, item) => sum + (item?._count?._all || 0), 0),
    total: total.map( item => ({
      currency: item.currency,
      count: item?._count?._all || 0,
      sum: item?._sum?.price || 0,
    }) ),
    yearCount: thisYear.reduce((sum, item) => sum + (item?._count?._all || 0), 0),
    year: thisYear.map( item => ({
      currency: item.currency,
      count: item?._count?._all || 0,
      sum: item?._sum?.price || 0,
    }) ),
    lastPayments: lastPayments,
  };
};

export async function SubscriptionActionMarkAsPaid(subscriptionId, userId, price = true) {
  const subscription = await SubscriptionGet(subscriptionId, userId);
  if (!subscription) {
    return false;
  }

  const nextPaymentDate = SubscriptionGetNextPaymentDate(subscription);
  const nextNotificationDate = SubscriptionGetNextNotificationDate({
    ...subscription,
    paymentDate: nextPaymentDate,
  });

  const operations = [
    prisma.subscription.update({
      where: {
        id: subscription.id,
        userId: userId,
      },
      data: {
        paymentDate: nextPaymentDate ?? subscription.paymentDate,
        enabled: !!nextPaymentDate,
        nextNotificationTime: nextPaymentDate ? nextNotificationDate?.date : null,
        nextNotificationDetails: nextPaymentDate ? nextNotificationDate?.details : {},
      },
    }),
  ];

  if (price) {
    operations.push(
      prisma.pastPayment.create({
        data: {
          userId: userId,
          subscriptionId: subscription.id,
          price: (typeof price === 'number') ? price : subscription.price,
          currency: subscription.currency,
          paymentDate: subscription.paymentDate,
        },
      })
    );
  }

  const [newSubscription, _pastPayment] = await Promise.allSettled(operations);

  if ( newSubscription?.status !== 'fulfilled' || !newSubscription?.value ) {
    console.warn('Error updating subscription payment date');
    return false;
  }
  return true;
}

export const SubscriptionActionMarkAsPaidSession = async (subscriptionId) => {
  const {isAuthenticated, getUserId} = await useAuthServer();
  if (!isAuthenticated()) {
    return false;
  }
  return SubscriptionActionMarkAsPaid(subscriptionId, getUserId());
}

export const SubscriptionActionMarkAsPaidSessionWithPrice = async (subscriptionId, price) => {
  const {isAuthenticated, getUserId} = await useAuthServer();
  if (!isAuthenticated()) {
    return false;
  }

  const parsedData = SchemaSubscriptionPrice.safeParse({price: price});
  if (!parsedData?.success || !parsedData?.data) {
    return false;
  }

  return SubscriptionActionMarkAsPaid(subscriptionId, getUserId(), parsedData.data.price);
}

export const SubscriptionActionMarkAsPaidSessionNoPrice = async (subscriptionId) => {
  const {isAuthenticated, getUserId} = await useAuthServer();
  if (!isAuthenticated()) {
    return false;
  }

  return SubscriptionActionMarkAsPaid(subscriptionId, getUserId(), false);
}

export async function SubscriptionActionEdit(data) {
  if (!data) {
    return { error: 'No data provided' };
  }

  const parsedData = SchemaSubscriptionEdit.safeParse(data);
  if (!parsedData?.success || !parsedData?.data) {
    return null;
  }

  const {isAuthenticated, getUserId} = await useAuthServer();
  if (!isAuthenticated()) {
    return null;
  }

  // If an ID is provided, verify the subscription exists and belongs to the user
  if (parsedData.data.id) {
    const existingSubscription = await prisma.subscription.findUnique({
      where: {
        id: parsedData.data.id,
        userId: getUserId(),
      },
      select: {
        id: true
      }
    });

    if (!existingSubscription) {
      console.warn('Unauthorized subscription update attempt');
      return null;
    }
  }

  // Create new categories first
  const createdCategories = await prisma.category.createManyAndReturn({
    data: parsedData.data.categories.filter(c => !c.id).map(category => ({
      name: category.name,
      color: category.color,
      userId: getUserId()
    })),
    skipDuplicates: true,
  });

  // Merge existing and created categories
  const existingCategories = parsedData.data.categories.filter(c => c.id);
  const allCategories = [...existingCategories, ...createdCategories];

  // Create new payment methods first
  const createdPaymentMethods = await prisma.paymentMethod.createManyAndReturn({
    data: parsedData.data.paymentMethods.filter(c => !c.id).map(paymentMethod => ({
      name: paymentMethod.name,
      icon: paymentMethod.icon,
      userId: getUserId()
    })),
    skipDuplicates: true,
  });

  // Merge existing and created payment methods
  const existingPaymentMethods = parsedData.data.paymentMethods.filter(c => c.id);
  const allPaymentMethods = [...existingPaymentMethods, ...createdPaymentMethods];

  // Prepare base subscription data
  const nextNotificationDate = SubscriptionGetNextNotificationDate(parsedData.data);
  const baseSubscriptionData = {
    userId: getUserId(),
    name: parsedData.data.name,
    logo: parsedData.data.logo,
    enabled: parsedData.data.enabled,
    price: parseFloat(parsedData.data.price),
    currency: parsedData.data.currency,
    paymentDate: parsedData.data.paymentDate,
    untilDate: parsedData.data.untilDate,
    timezone: parsedData.data.timezone,
    cycle: parsedData.data.cycle,
    url: parsedData.data.url,
    notes: parsedData.data.notes,
    notifications: parsedData.data.notifications,
    nextNotificationTime: nextNotificationDate ? nextNotificationDate.date : null,
    nextNotificationDetails: nextNotificationDate ? nextNotificationDate.details : {},
  };

  // Validate that all required fields have values
  if (!baseSubscriptionData.name || !baseSubscriptionData.price || !baseSubscriptionData.paymentDate) {
    console.warn('Missing required fields');
    return null;
  }

  await prisma.subscription.upsert({
    where: {
      id: parsedData.data?.id || '',
      userId: getUserId(),
    },
    update: {
      ...baseSubscriptionData,
      categories: {
        set: [], // First disconnect all categories
        connect: allCategories.map(c => ({ id: c.id }))
      },
      paymentMethods: {
        set: [], // First disconnect all payment methods
        connect: allPaymentMethods.map(c => ({ id: c.id }))
      },
    },
    create: {
      ...baseSubscriptionData,
      categories: {
        connect: allCategories.map(c => ({ id: c.id }))
      },
      paymentMethods: {
        connect: allPaymentMethods.map(c => ({ id: c.id }))
      },
    }
  });

  revalidatePath('/');
  redirect('/');
  return { success: true };
}

export async function SubscriptionActionDelete(subscriptionId, userId = undefined) {
  if (!userId) {
    const {isAuthenticated, getUserId} = await useAuthServer();
    if (!isAuthenticated()) {
      return false;
    }
    userId = getUserId();
  }

  const subscription = await SubscriptionGet(subscriptionId, userId);
  if (!subscription) {
    return false;
  }

  await prisma.subscription.delete({
    where: {
      id: subscription.id,
      userId: subscription.userId,
    }
  });
  revalidatePath('/');
  redirect('/');
  return { success: true };
}
