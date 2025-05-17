'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { DefaultCategories } from '@/config/categories';
import {
  SchemaCategoryId,
  SchemaCategory,
  SchemaTimezone,
  SchemaCurrency,
  SchemaUserNotifications,
  SchemaUserName,
  SchemaWebhook,
} from './schema';
import { sendWebhook } from '@/components/subscriptions/webhook';

export const UserGetCategories = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const categories = await prisma.category.findMany({
    where: {
      userId: session.user.id
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
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const createdCategories = await prisma.category.createManyAndReturn({
    data: Object.entries(DefaultCategories).map(([name, color]) => ({
      userId: session.user.id,
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
    color: category.color
  })).sort((a, b) => a.name.localeCompare(b.name));
};

export const UserRemoveCategory = async (id) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const validatedData = SchemaCategoryId.parse({ id: id });
  if (!validatedData) {
    throw new Error('Invalid category id');
  }

  const deletedCategory = await prisma.category.delete({
    where: { id: validatedData.id, userId: session.user.id }
  });

  if (!deletedCategory) {
    throw new Error('Failed to delete category');
  }

  return {
    id: deletedCategory.id,
  };
};

export const UserSaveCategory = async (category) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

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
      where: { id: validatedData.id, userId: session.user.id },
      data: validatedData
    }) :
    await prisma.category.create({
      data: {
        ...validatedData,
        userId: session.user.id
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

export const UserUpdateTimezone = async (timezone) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const validatedData = SchemaTimezone.parse(timezone);
  if (!validatedData) {
    throw new Error('Invalid timezone data');
  }

  const updated = await prisma.user.update({
    where: {
      id: session.user.id,
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
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const validatedData = SchemaCurrency.parse(currency);
  if (!validatedData) {
    throw new Error('Invalid currency data');
  }

  const updated = await prisma.user.update({
    where: {
      id: session.user.id,
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
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const validatedData = SchemaUserNotifications.parse(notifications);
  if (!validatedData) {
    throw new Error('Invalid notifications data');
  }

  const updated = await prisma.user.update({
    where: {
      id: session.user.id,
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

export const UserUpdateWebhook = async (webhook) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const result = SchemaWebhook.safeParse(webhook);
  if (!result.success) {
    return { success: false, webhook: webhook };
  }
  const validatedData = result.data;

  // Check if the webhook URL is valid
  if (validatedData && validatedData !== '') {
    const isSuccess = await sendWebhook(validatedData, {
      event: 'verify',
    });
    if (!isSuccess) {
      return { success: false, webhook: validatedData };
    }
  }

  const updated = await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      webhook: validatedData,
    }
  });

  if (!updated) {
    return { success: false, webhook: validatedData };
  }

  return { success: true, webhook: updated.webhook };
};

export const UserUpdateName = async (name) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const validatedData = SchemaUserName.parse(name);
  if (!validatedData) {
    throw new Error('Invalid name data');
  }

  const updated = await prisma.user.update({
    where: {
      id: session.user.id,
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
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
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
    subscriptions: user.subscriptions,
  };
};
