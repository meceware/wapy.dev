'use server'

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PushNotificationSubscribe(subscription) {
  const session = await auth()
  if (!session) {
    throw new Error('Unauthorized');
  }

  const pushSubscription = await prisma.pushSubscription.upsert({
    where: {
      userId_endpoint: {
        userId: session.user.id,
        endpoint: subscription.endpoint
      }
    },
    update: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth
    },
    create: {
      userId: session.user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth
    }
  });

  return pushSubscription ? { success: true } : { success: false };
}

export async function PushNotificationUnsubscribe(endpoint) {
  const session = await auth()
  if (!session) {
    throw new Error('Unauthorized');
  }

  const pushSubscription = await prisma.pushSubscription.deleteMany({
    where: {
      userId: session.user.id,
      endpoint
    }
  });

  return pushSubscription ? { success: true } : { success: false };
}

export async function PushNotificationCheckEndpoint(endpoint) {
  if (!endpoint) {
    return { success: false };
  }

  const session = await auth()
  if (!session) {
    throw new Error('Unauthorized');
  }

  const pushSubscription = await prisma.pushSubscription.findFirst({
    where: {
      userId: session.user.id,
      endpoint
    }
  });

  return pushSubscription ? { success: true } : { success: false };
}

export async function PastNotificationsGetUnread() {
  const session = await auth();
  if (!session?.user?.id) {
    return { notifications: [], unreadCount: 0 };
  }

  const [notifications, unreadCount] = await Promise.all([
    prisma.pastNotification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      omit: {
        userId: true,
        subscriptionId: true,
      },
    }),
    prisma.pastNotification.count({
      where: {
        userId: session.user.id,
        read: false,
      },
    }),
  ]);

  return {
    notifications: notifications || [],
    unreadCount: unreadCount || 0
  };
}

export async function PastNotificationsMarkAsRead(id) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false };
  }

  await prisma.pastNotification.delete({
    where: {
      id: id,
      userId: session.user.id,
    },
  });

  return { success: true };
}

export async function PastNotificationsMarkAllAsRead() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false };
  }

  await prisma.pastNotification.deleteMany({
    where: {
      userId: session.user.id,
    },
  });

  return { success: true };
}
