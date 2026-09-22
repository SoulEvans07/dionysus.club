import { z } from 'zod';

const ErrorBody = z.object({ error: z.string() });

// Prefers the API's own message (e.g. "Unknown ingredient") over a generic status line.
export async function assertOk(resp: Response, fallback: string) {
  if (resp.ok) return;

  const body = ErrorBody.safeParse(await resp.json().catch(() => null));
  throw new Error(body.success ? body.data.error : `HTTP ${resp.status}: ${fallback}`);
}

export async function sendJson(url: string, method: 'POST' | 'PUT', body: unknown, fallback: string) {
  const resp = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  await assertOk(resp, fallback);

  return z.object({ id: z.string() }).parse(await resp.json());
}
