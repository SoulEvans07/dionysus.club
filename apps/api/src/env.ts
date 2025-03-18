import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envVariables = z.object({
  // DATABASE_URL: z.string(),
  // CLIENT_URL: z.string(),
  PORT: z.coerce.number().optional(),
});

envVariables.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
