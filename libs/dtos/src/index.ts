import { z } from 'zod';

export const TestType = z.object({
  name: z.string().optional(),
});
