import { z } from 'zod';

export const upsertProfileSchema = z.object({
  institution: z.string().optional(),
  type: z.string().optional(),
  department: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
});

export type ProfileBody = z.infer<typeof upsertProfileSchema>;
