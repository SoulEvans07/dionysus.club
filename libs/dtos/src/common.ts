import { z } from 'zod';

export const IdRespDTO = z.object({ id: z.string() });
export type IdRespDTO = z.infer<typeof IdRespDTO>;
