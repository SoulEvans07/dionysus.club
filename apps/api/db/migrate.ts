// Prints structured PostgreSQL error fields (code, detail, hint, constraint, ...) when a
// migration fails - drizzle-kit's own `migrate`/`db:migr` swallows these into an unhelpful
// generic error. Workaround for drizzle-kit@0.45.2; remove once fixed upstream.
// https://github.com/drizzle-team/drizzle-orm/pull/5426
// https://github.com/drizzle-team/drizzle-orm/issues/5178

import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

import '~/env';

const PG_ERROR_FIELDS = [
  'message',
  'severity',
  'code',
  'detail',
  'hint',
  'position',
  'where',
  'schema',
  'table',
  'column',
  'dataType',
  'constraint',
  'file',
  'line',
  'routine',
] as const;

type PgErrorLike = Partial<Record<(typeof PG_ERROR_FIELDS)[number], unknown>> & { cause?: unknown };

function formatPgError(error: unknown): Record<string, unknown> {
  if (!(error instanceof Error)) return { message: String(error) };

  const pgError = error as Error & PgErrorLike;
  const formatted: Record<string, unknown> = {};

  for (const field of PG_ERROR_FIELDS) {
    const value = pgError[field];
    if (value !== undefined && value !== null) formatted[field] = value;
  }

  if (pgError.cause) formatted.cause = formatPgError(pgError.cause);

  return formatted;
}

async function run() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  const loggerEnabled = process.env.DB_MIGRATE_DEBUG_SQL === '1';

  try {
    await client.connect();
    const db = drizzle(client, { logger: loggerEnabled });

    await migrate(db, { migrationsFolder: './db/migrations' });
    console.log('Migrations applied successfully.');
  } catch (error) {
    console.error('Migration failed with PostgreSQL error details:');
    console.error(JSON.stringify(formatPgError(error), null, 2));

    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }

    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}

run();
