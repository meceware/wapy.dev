import { z } from 'zod';

export const SchemaSubscriptionId = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid().optional(),
});

export const SchemaNotifications = z.array(z.object({
  type: z.array(z.enum(['EMAIL', 'PUSH', 'WEBHOOK'])),
  time: z.enum(['INSTANT', 'MINUTES', 'HOURS', 'DAYS', 'WEEKS']),
  due: z.number().int().min(0),
}));

export const SchemaSubscriptionEdit = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.'
  }),
  logo: z
    .string()
    .optional(),
  enabled: z.boolean().default(true),
  price: z.coerce.number().positive().multipleOf(0.01).min(0.01),
  currency: z.string().default('EUR'),
  paymentDate: z.date({
    required_error: 'Payment date is required',
    invalid_type_error: 'That\'s not a valid date!'
  }),
  untilDate: z.date().optional().nullish(),
  timezone: z.string(),
  cycle: z.object({
    time: z.enum(['DAYS', 'WEEKS', 'MONTHS', 'YEARS']),
    every: z.number().int().positive()
  }),
  url: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
  categories: z.array(
    z.object({
      id: z.string().cuid().optional().or(z.literal('')),
      name: z.string().min(1),
      color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color')
    })
  ).optional(),
  paymentMethods: z.array(
    z.object({
      id: z.string().cuid().optional().or(z.literal('')),
      name: z.string().min(1),
      icon: z.string().optional()
    })
  ).optional(),
  notifications: SchemaNotifications.optional(),
});
