'use server'

import { useAuthServer } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function PushNotificationSubscribe(subscription) {
  const {isAuthenticated, getUserId} = await useAuthServer();
  if (!isAuthenticated()) {
    throw new Error('Unauthorized');
  }

  const pushSubscription = await prisma.pushSubscription.upsert({
    where: {
      userId_endpoint: {
        userId: getUserId(),
        endpoint: subscription.endpoint
      }
    },
    update: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth
    },
    create: {
      userId: getUserId(),
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth
    }
  });

  return pushSubscription ? { success: true } : { success: false };
}

export async function PushNotificationUnsubscribe(endpoint) {
  const {isAuthenticated, getUserId} = await useAuthServer();
  if (!isAuthenticated()) {
    throw new Error('Unauthorized');
  }

  const pushSubscription = await prisma.pushSubscription.deleteMany({
    where: {
      userId: getUserId(),
      endpoint
    }
  });

  return pushSubscription ? { success: true } : { success: false };
}

export async function PushNotificationCheckEndpoint(endpoint) {
  if (!endpoint) {
    return { success: false };
  }

  const {isAuthenticated, getUserId} = await useAuthServer();
  if (!isAuthenticated()) {
    throw new Error('Unauthorized');
  }

  const pushSubscription = await prisma.pushSubscription.findFirst({
    where: {
      userId: getUserId(),
      endpoint
    }
  });

  return pushSubscription ? { success: true } : { success: false };
}

export async function PastNotificationsGetUnread() {
  const {isAuthenticated, getUserId} = await useAuthServer();
  if (!isAuthenticated()) {
    return { notifications: [], unreadCount: 0 };
  }

  const [notifications, unreadCount] = await Promise.all([
    prisma.pastNotification.findMany({
      where: {
        userId: getUserId(),
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
        userId: getUserId(),
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
  const {isAuthenticated, getUserId} = await useAuthServer();
  if (!isAuthenticated()) {
    return { success: false };
  }

  await prisma.pastNotification.delete({
    where: {
      id: id,
      userId: getUserId(),
    },
  });

  return { success: true };
}

export async function PastNotificationsMarkAllAsRead() {
  const {isAuthenticated, getUserId} = await useAuthServer();
  if (!isAuthenticated()) {
    return { success: false };
  }

  await prisma.pastNotification.deleteMany({
    where: {
      userId: getUserId(),
    },
  });

  return { success: true };
}
