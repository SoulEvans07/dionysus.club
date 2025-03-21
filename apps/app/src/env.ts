import { z } from 'zod';

const envVariables = z.object({
  VITE_SERVER_URL: z.string(),
});

envVariables.parse(import.meta.env);

declare global {
  interface ImportMetaEnv extends z.infer<typeof envVariables> {}
}
