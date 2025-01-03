import { z } from 'zod';
import { SchemaNotifications } from '@/components/subscriptions/schema';

export const SchemaCategoryId = z.object({
  id: z.string().cuid()
});

export const SchemaCategory = z.object({
  name: z.string().min(1),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color')
});

export const SchemaTimezone = z.string().min(1);
export const SchemaCurrency = z.string().length(3);

export const SchemaUserNotifications = SchemaNotifications;

export const SchemaUserName = z.string().min(1);