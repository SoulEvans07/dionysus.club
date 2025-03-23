import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envVariables = z.object({
  PORT: z.coerce.number().optional(),
  CLIENT_URL: z.string(),
  DATABASE_URL: z.string(),

  KINDE_DOMAIN: z.string(),
  KINDE_CLIENT_ID: z.string(),
  KINDE_CLIENT_SECRET: z.string(),
  KINDE_REDIRECT_URI: z.string().url(),
  KINDE_LOGOUT_REDIRECT_URI: z.string().url(),
});

envVariables.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
