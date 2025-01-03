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
} from './schema';

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

  return await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      timezone: validatedData,
    }
  });
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

  return await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      currency: validatedData,
    }
  });
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

  return await prisma.user.update({
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

  return await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      name: validatedData,
    }
  });
};
