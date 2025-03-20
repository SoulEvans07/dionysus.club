import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envVariables = z.object({
  PORT: z.coerce.number().optional(),
  CLIENT_URL: z.string(),
  DATABASE_URL: z.string(),
});

envVariables.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
