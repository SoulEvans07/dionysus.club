import { z } from 'zod';
import { BasicHeaders } from './headers';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
// Controllers answer with `{ error: 'message' }`; thrown errors may carry `{ error: { message } }`.
export const ErrorBody = z.object({
  error: z.union([z.string(), z.object({ message: z.string() })]),
});
export type ErrorBody = z.infer<typeof ErrorBody>;

export type Primitive = boolean | number | string;
export type QueryParams = Record<string, Primitive | Primitive[] | undefined | null>;

export type HeaderValue = string | number | boolean;
export type RequestHeaders = Partial<Record<BasicHeaders, HeaderValue | undefined>> &
  Record<string, HeaderValue | undefined>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RequestBody = any;

export type Parser<T> = (data: unknown) => T;
export type RequestOptions = { headers?: RequestHeaders; body?: RequestBody };
export type GetRequestOptions = Omit<RequestOptions, 'body'> & { query?: QueryParams };
