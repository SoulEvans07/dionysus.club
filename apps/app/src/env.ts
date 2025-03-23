import { z } from 'zod';

const envVariables = z.object({});

envVariables.parse(import.meta.env);

declare global {
  interface ImportMetaEnv extends z.infer<typeof envVariables> {}
}
