import { z } from 'zod';

export const signInSchema = z.object({
  email: z.email({ message: 'Invalid email!'})
    .trim()
    .min(1, { message: 'Email is required!' }),
});

export const signInOTPSchema = z.object({
  code: z.string().trim()
    .length(6, { message: 'Code must be 6 digits!' })
    .regex(/^[0-9]+$/, { message: 'Code must only include numbers!' }),
});
