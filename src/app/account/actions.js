'use server';

import { useAuthServer } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { DefaultCategories } from '@/config/categories';
import { DefaultPaymentMethods } from '@/config/payment-methods';
import {
  SendWebhook,
  SendNtfy,
  SendDiscord,
  SendSlack,
} from '@/components/subscriptions/external-services';
import {
  SchemaCategoryId,
  SchemaCategory,
  SchemaPaymentMethodId,
  SchemaPaymentMethod,
  SchemaTimezone,
  SchemaCurrency,
  SchemaUserNotifications,
  SchemaUserName,
  SchemaNtfyService,
  SchemaWebhookService,
  SchemaDiscordService,
  SchemaSlackService,
} from './schema';
import { siteConfig } from '@/components/config';

export const UserGetCategories = async () => {
  const {isAuthenticated, getUserId} = await useAuthServer();
  if (!isAuthenticated()) {
    throw new Error('Unauthorized');
  }

  const categories = await prisma.category.findMany({
    where: {
      userId: getUserId(),
    },
    orderBy: {
      name: 'asc'
    },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    color: category.color
  }));
};

export const UserLoadDefaultCategories = async () => {
  const {isAuthenticated, getUserId} = await useAuthServer();
  if (!isAuthenticated()) {
    throw new Error('Unauthorized');
  }

  const createdCategories = await prisma.category.createManyAndReturn({
    data: Object.entries(DefaultCategories).map(([name, color]) => ({
      userId: getUserId(),
      name: name,
      color: color
    })),
    skipDuplicates: true,
  });

  if (!createdCategories) {
    throw new Error('Failed to create default categories');
  }

  return createdCategories.map((category) => ({
    id: category.id,
    name: category.name,
    color: category.color,
  })).sort((a, b) => a.name.localeCompare(b.name));
};

export const UserRemoveCategory = async (id) => {
  const {isAuthenticated, getUserId} = await useAuthServer();
  if (!isAuthenticated()) {
    throw new Error('Unauthorized');
  }

  const validatedData = SchemaCategoryId.parse({ id: id });
  if (!validatedData) {
    throw new Error('Invalid category id');
  }

  const deletedCategory = await prisma.category.delete({
    where: {
      id: validatedData.id,
      userId: getUserId(),
    },
  });

  if (!deletedCategory) {
    throw new Error('Failed to delete category');
  }

  return {
    id: deletedCategory.id,
  };
};

export const UserSaveCategory = async (category) => {
  const {isAuthenticated, getUserId} = await useAuthServer();
  if (!isAuthenticated()) {
    throw new Error('Unauthorized');
  }

  const userId = getUserId();
  const schema = category.id !== null ? z.intersection(
    SchemaCategoryId,
    SchemaCategory,
  ) : SchemaCategory;
  const validatedData = schema.parse(category);
  if (!validatedData) {
    throw new Error('Invalid category data');
  }

  const updatedCategory = validatedData.id ?
    await prisma.category.update({
      where: { id: validatedData.id, userId: userId },
      data: validatedData
    }) :
    await prisma.category.create({
      data: {
        ...validatedData,
        userId: userId,
      }
    });

  if (!updatedCategory) {
    throw new Error('Failed to update category');
  }

  return {
    id: updatedCategory.id,
    name: updatedCategory.name,
    color: updatedCategory.color
  };
};

export const UserGetPaymentMethods = async () => {
  const {isAuthenticated, getUserId} = await useAuthServer();
  if (!isAuthenticated()) {
    throw new Error('Unauthorized');
  }

  const paymentMethods = await prisma.paymentMethod.findMany({
    where: {
      userId: getUserId(),
    },
    orderBy: {
      name: 'asc'
    },
  });

  return paymentMethods.map((paymentMethod) => ({
    id: paymentMethod.id,
    name: paymentMethod.name,
    icon: paymentMethod.icon,
  }));
};

export const UserLoadDefaultPaymentMethods = async () => {
  const {isAuthenticated, getUserId} = await useAuthServer();
  if (!isAuthenticated()) {
    throw new Error('Unauthorized');
  }

  const createdPaymentMethods = await prisma.paymentMethod.createManyAndReturn({
    data: Object.entries(DefaultPaymentMethods).map(([name, icon]) => ({
      userId: getUserId(),
      name: name,
      icon: icon
    })),
    skipDuplicates: true,
  });

  if (!createdPaymentMethods) {
    throw new Error('Failed to create default payment methods');
  }

  return createdPaymentMethods.map((paymentMethod) => ({
    id: paymentMethod.id,
    name: paymentMethod.name,
    icon: paymentMethod.icon,
  })).sort((a, b) => a.name.localeCompare(b.name));
};

export const UserRemovePaymentMethod = async (id) => {
  const {isAuthenticated, getUserId} = await useAuthServer();
  if (!isAuthenticated()) {
    throw new Error('Unauthorized');
  }

  const validatedData = SchemaPaymentMethodId.parse({ id: id });
  if (!validatedData) {
    throw new Error('Invalid payment method id');
  }

  const deletedPaymentMethod = await prisma.paymentMethod.delete({
    where: { id: validatedData.id, userId: getUserId() }
  });

  if (!deletedPaymentMethod) {
    throw new Error('Failed to delete payment method');
  }

  return {
    id: deletedPaymentMethod.id,
  };
};

export const UserSavePaymentMethod = async (paymentMethod) => {
  const {isAuthenticated, getUserId} = await useAuthServer();
  if (!isAuthenticated()) {
    throw new Error('Unauthorized');
  }

  const userId = getUserId();
  const schema = paymentMethod.id !== null ? z.intersection(
    SchemaPaymentMethodId,
    SchemaPaymentMethod,
  ) : SchemaPaymentMethod;
  const validatedData = schema.parse(paymentMethod);
  if (!validatedData) {
    throw new Error('Invalid payment method data');
  }

  const updatedPaymentMethod = validatedData.id ?
    await prisma.paymentMethod.update({
      where: { id: validatedData.id, userId: userId },
      data: validatedData
    }) :
    await prisma.paymentMethod.create({
      data: {
        ...validatedData,
        userId: userId
      }
    });

  if (!updatedPaymentMethod) {
    throw new Error('Failed to update payment method');
  }

  return {
    id: updatedPaymentMethod.id,
    name: updatedPaymentMethod.name,
    icon: updatedPaymentMethod.icon
  };
};

export const UserUpdateTimezone = async (timezone) => {
  const {isAuthenticated, getUserId} = await useAuthServer();
  if (!isAuthenticated()) {
    throw new Error('Unauthorized');
  }

  const validatedData = SchemaTimezone.parse(timezone);
  if (!validatedData) {
    throw new Error('Invalid timezone data');
  }

  const updated = await prisma.user.update({
    where: {
      id: getUserId(),
    },
    data: {
      timezone: validatedData,
    }
  });

  if (!updated) {
    return { success: false, timezone: validatedData };
  }

  return { success: true, timezone: updated.timezone };
};

export const UserUpdateCurrency = async (currency) => {
  const {isAuthenticated, getUserId} = await useAuthServer();
  if (!isAuthenticated()) {
    throw new Error('Unauthorized');
  }

  const validatedData = SchemaCurrency.parse(currency);
  if (!validatedData) {
    throw new Error('Invalid currency data');
  }

  const updated = await prisma.user.update({
    where: {
      id: getUserId(),
    },
    data: {
      currency: validatedData,
    }
  });

  if (!updated) {
    return { success: false, currency: validatedData };
  }

  return { success: true, currency: updated.currency };
};

export const UserUpdateNotifications = async (notifications) => {
  const {isAuthenticated, getUserId} = await useAuthServer();
  if (!isAuthenticated()) {
    throw new Error('Unauthorized');
  }

  const validatedData = SchemaUserNotifications.parse(notifications);
  if (!validatedData) {
    throw new Error('Invalid notifications data');
  }

  const updated = await prisma.user.update({
    where: {
      id: getUserId(),
    },
    data: {
      notifications: validatedData.map(notification => {
        if (notification.due === 0 && notification.time !== 'INSTANT') {
          return {
            ...notification,
            time: 'INSTANT'
          };
        }
        return notification;
      }),
    }
  });

  if (!updated) {
    return { success: false, notifications: validatedData };
  }

  return { success: true, notifications: updated.notifications };
};

export const UserUpdateName = async (name) => {
  const {isAuthenticated, getUserId} = await useAuthServer();
  if (!isAuthenticated()) {
    throw new Error('Unauthorized');
  }

  const validatedData = SchemaUserName.parse(name);
  if (!validatedData) {
    throw new Error('Invalid name data');
  }

  const updated = await prisma.user.update({
    where: {
      id: getUserId(),
    },
    data: {
      name: validatedData,
    }
  });

  if (!updated) {
    return { success: false, name: validatedData };
  }

  return { success: true, name: updated.name };
};

export const UserExportData = async () => {
  const {isAuthenticated, getUserId} = await useAuthServer();
  if (!isAuthenticated()) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: {
      id: getUserId(),
    },
    select: {
      name: true,
      timezone: true,
      currency: true,
      notifications: true,
      categories: {
        select: {
          name: true,
          color: true
        }
      },
      paymentMethods: {
        select: {
          name: true,
          icon: true
        }
      },
      subscriptions: {
        select: {
          name: true,
          logo: true,
          enabled: true,
          price: true,
          currency: true,
          paymentDate: true,
          untilDate: true,
          timezone: true,
          cycle: true,
          url: true,
          notes: true,
          categories: {
            select: {
              name: true,
              color: true
            }
          },
          paymentMethods: {
            select: {
              name: true,
              icon: true
            }
          },
          notifications: true,
        }
      }
    }
  });

  return {
    user: {
      timezone: user.timezone,
      currency: user.currency,
      notifications: user.notifications,
      name: user?.name || '',
    },
    categories: user.categories,
    paymentMethods: user.paymentMethods,
    subscriptions: user.subscriptions,
  };
};

export const UserSaveNtfy = async (config) => {
  const {isAuthenticated, getUserId} = await useAuthServer();
  if (!isAuthenticated()) {
    throw new Error('Unauthorized');
  }

  const result = SchemaNtfyService.safeParse(config);
  if (!result.success) {
    return { success: false };
  }
  const validatedData = result.data;

  const userId = getUserId();

  // Use Prisma transaction
  const updated = await prisma.$transaction(async (tx) => {
    // Get current user data
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { externalServices: true }
    });

    const currentServices = user?.externalServices || {};

    return await tx.user.update({
      where: {
        id: userId,
      },
      data: {
        externalServices: {
          ...currentServices,
          ntfy: validatedData.enabled === false
            // If only disabling, just set enabled to false
            ? {
                ...(currentServices.ntfy || {}),
                enabled: false,
              }
            : {
                ...validatedData,
                // Change token if necessary (full of *, since it's hidden on client component)
                token: (validatedData.token && validatedData.token.match(/^\*+$/))
                  ? currentServices?.ntfy?.token
                  : validatedData.token,
            },
        },
      }
    });
  });

  return { success: !!updated };
};

export const UserTestNtfy = async (config) => {
  const {isAuthenticated, getUserId} = await useAuthServer();
  if (!isAuthenticated()) {
    throw new Error('Unauthorized');
  }

  const result = SchemaNtfyService.safeParse(config);
  if (!result.success) {
    return { success: false };
  }
  const validatedData = result.data;

  // If token is all asterisks, get the real token from database
  if (validatedData.token && validatedData.token.match(/^\*+$/)) {
    const user = await prisma.user.findUnique({
      where: { id: getUserId() },
      select: { externalServices: true }
    });

    const storedToken = user?.externalServices?.ntfy?.token;
    if (storedToken) {
      validatedData.token = storedToken;
    } else {
      delete validatedData.token;
    }
  }

  const success = await SendNtfy(validatedData, {
    title: `${siteConfig.name} Test Notification`,
    message: `This is a test notification from ${siteConfig.name}. Your ntfy integration is configured correctly.`,
    actions: [
      {
        action: 'view',
        label: 'View',
        url: siteConfig.url,
        clear: true
      }
    ]
  });

  return { success: success };
};

export const UserSaveWebhook = async (config) => {
  const {isAuthenticated, getUserId} = await useAuthServer();
  if (!isAuthenticated()) {
    throw new Error('Unauthorized');
  }

  const result = SchemaWebhookService.safeParse(config);
  if (!result.success) {
    return { success: false };
  }
  const validatedData = result.data;

  const userId = getUserId();

  // Use Prisma transaction
  const updated = await prisma.$transaction(async (tx) => {
    // Get current user data
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { externalServices: true }
    });

    const currentServices = user?.externalServices || {};

    return await tx.user.update({
      where: {
        id: userId,
      },
      data: {
        externalServices: {
          ...currentServices,
          webhook: validatedData.enabled === false
            // If only disabling, just set enabled to false
            ? {
                ...(currentServices.webhook || {}),
                enabled: false,
              }
            : validatedData,
        },
      }
    });
  });

  return { success: !!updated };
};

export const UserTestWebhook = async (config) => {
  const result = SchemaWebhookService.safeParse(config);
  if (!result.success) {
    return { success: false };
  }
  const validatedData = result.data;

  const success = await SendWebhook(
    validatedData.url,
    {
      event: 'test-notification',
      title: `${siteConfig.name} Test Notification`,
      message: `This is a test webhook from ${siteConfig.name}. Your webhook integration is configured correctly.`,
      tags: ['wapy.dev'],
      timestamp: new Date().toISOString(),
    }
  );

  return { success: success };
};

export const UserSaveDiscord = async (config) => {
  const {isAuthenticated, getUserId} = await useAuthServer();
  if (!isAuthenticated()) {
    throw new Error('Unauthorized');
  }

  const result = SchemaDiscordService.safeParse(config);
  if (!result.success) {
    return { success: false };
  }
  const validatedData = result.data;

  const userId = getUserId();

  // Use Prisma transaction
  const updated = await prisma.$transaction(async (tx) => {
    // Get current user data
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { externalServices: true }
    });

    const currentServices = user?.externalServices || {};

    return await tx.user.update({
      where: {
        id: userId,
      },
      data: {
        externalServices: {
          ...currentServices,
          discord: validatedData.enabled === false
            // If only disabling, just set enabled to false
            ? {
                ...(currentServices.discord || {}),
                enabled: false,
              }
            : validatedData,
        },
      }
    });
  });

  return { success: !!updated };
};

export const UserTestDiscord = async (config) => {
  const result = SchemaDiscordService.safeParse(config);
  if (!result.success) {
    return { success: false };
  }

  const success = await SendDiscord(
    result.data,
    {
      title: `${siteConfig.name} Test Notification`,
      message: `This is a test Discord message from ${siteConfig.name}. Your Discord integration is configured correctly.`,
    }
  );

  return { success: success };
};

export const UserSaveSlack = async (config) => {
  const {isAuthenticated, getUserId} = await useAuthServer();
  if (!isAuthenticated()) {
    throw new Error('Unauthorized');
  }

  const result = SchemaSlackService.safeParse(config);
  if (!result.success) {
    return { success: false };
  }
  const validatedData = result.data;

  const userId = getUserId();

  // Use Prisma transaction
  const updated = await prisma.$transaction(async (tx) => {
    // Get current user data
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { externalServices: true }
    });

    const currentServices = user?.externalServices || {};

    return await tx.user.update({
      where: {
        id: userId,
      },
      data: {
        externalServices: {
          ...currentServices,
          slack: validatedData.enabled === false
            // If only disabling, just set enabled to false
            ? {
                ...(currentServices.slack || {}),
                enabled: false,
              }
            : validatedData,
        },
      }
    });
  });

  return { success: !!updated };
};

export const UserTestSlack = async (config) => {
  const result = SchemaSlackService.safeParse(config);
  if (!result.success) {
    return { success: false };
  }

  const success = await SendSlack(
    result.data,
    {
      title: `${siteConfig.name} Test Notification`,
      message: `This is a test Slack message from ${siteConfig.name}. Your Slack integration is configured correctly.`,
    }
  );

  return { success: success };
};