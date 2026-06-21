import { z } from 'zod';

export const ActivityInputSchema = z.object({
  category: z.enum(['transportation', 'food', 'energy', 'Transport', 'Food', 'Energy']),
  value: z.number().positive("Value must be greater than 0"),
  label: z.string().min(1).max(100).transform(val => val.replace(/[<>]/g, "")), // Strips XSS-prone HTML tags
});

export type ActivityInput = z.infer<typeof ActivityInputSchema>;
