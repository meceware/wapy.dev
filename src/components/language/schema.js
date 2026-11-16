import { z } from 'zod';
import { getSupportedLanguageCodes } from '@/config/languages';

export const LanguageCodeSchema = z.object({
  language: z
    .string()
    .min(1)
    .max(5)
    .refine((val) => getSupportedLanguageCodes().includes(val)),
});