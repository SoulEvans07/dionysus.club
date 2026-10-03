import {
  ErrorBody,
  type Parser,
  type GetRequestOptions,
  type HttpMethod,
  type RequestOptions,
  type RequestHeaders,
} from './types';
import { defaultHeaders, noopParse } from './constants';
import { Ariadne } from '../url';

export class Styx {
  public static async get<T>(url: string, parser: Parser<T>): Promise<T>;
  public static async get<T>(url: string, opt: GetRequestOptions, parser: Parser<T>): Promise<T>;
  public static async get<T>(url: string, arg1: GetRequestOptions | Parser<T>, arg2?: Parser<T>): Promise<T> {
    const method: HttpMethod = 'GET';
    const { opts, parse } = this.resolveGetArgs(arg1, arg2);

    const resp = await fetch(Ariadne.merge(url, opts.query), {
      method,
      headers: { ...defaultHeaders, ...this.serializeHeaders(opts.headers) },
    });
    await this.assertOk(resp, method);

    return await this.parseBody(resp, parse);
  }

  public static async post(url: string, options?: RequestOptions): Promise<void>;
  public static async post<T>(url: string, parser: Parser<T>): Promise<T>;
  public static async post<T>(url: string, options: RequestOptions, parser: Parser<T>): Promise<T>;
  public static async post<T>(url: string, arg1?: RequestOptions | Parser<T>, arg2?: Parser<T>): Promise<T | void> {
    const { opts, parse } = this.resolveArgs(arg1, arg2);
    return await this.request('POST', url, opts, parse);
  }

  public static async put(url: string, options?: RequestOptions): Promise<void>;
  public static async put<T>(url: string, parser: Parser<T>): Promise<T>;
  public static async put<T>(url: string, options: RequestOptions, parser: Parser<T>): Promise<T>;
  public static async put<T>(url: string, arg1?: RequestOptions | Parser<T>, arg2?: Parser<T>): Promise<T | void> {
    const { opts, parse } = this.resolveArgs(arg1, arg2);
    return await this.request('PUT', url, opts, parse);
  }

  public static async patch(url: string, options?: RequestOptions): Promise<void>;
  public static async patch<T>(url: string, parser: Parser<T>): Promise<T>;
  public static async patch<T>(url: string, options: RequestOptions, parser: Parser<T>): Promise<T>;
  public static async patch<T>(url: string, arg1?: RequestOptions | Parser<T>, arg2?: Parser<T>): Promise<T | void> {
    const { opts, parse } = this.resolveArgs(arg1, arg2);
    return await this.request('PATCH', url, opts, parse);
  }

  public static async delete(url: string, options?: RequestOptions): Promise<void>;
  public static async delete<T>(url: string, parser: Parser<T>): Promise<T>;
  public static async delete<T>(url: string, options: RequestOptions, parser: Parser<T>): Promise<T>;
  public static async delete<T>(url: string, arg1?: RequestOptions | Parser<T>, arg2?: Parser<T>): Promise<T | void> {
    const { opts, parse } = this.resolveArgs(arg1, arg2);
    return await this.request('DELETE', url, opts, parse);
  }

  private static async request<T>(
    method: HttpMethod,
    url: string,
    opts: RequestOptions = {},
    parse: Parser<T>
  ): Promise<T> {
    const resp = await fetch(url, {
      method,
      headers: { ...defaultHeaders, ...this.serializeHeaders(opts.headers) },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
    await this.assertOk(resp, method);
    return await this.parseBody(resp, parse);
  }

  private static resolveGetArgs<T>(arg1?: GetRequestOptions | Parser<T>, arg2?: Parser<T>) {
    if (typeof arg1 === 'function') return { opts: {}, parse: arg1 };
    if (!arg2) throw new Error('Missing parser on GET request');
    return { opts: arg1 ?? {}, parse: arg2 };
  }

  private static resolveArgs<T>(arg1?: RequestOptions | Parser<T>, arg2?: Parser<T>) {
    if (typeof arg1 === 'function') return { opts: {}, parse: arg1 };
    return { opts: arg1 ?? {}, parse: arg2 ?? noopParse };
  }

  private static async parseBody<T>(resp: Response, parse?: Parser<T>): Promise<T> {
    const text = await resp.text();
    const body = JSON.parse(text.trim() || 'null');
    if (!parse) return body;
    return parse(body);
  }

  private static async assertOk(resp: Response, method: HttpMethod) {
    if (resp.ok) return;

    const body = ErrorBody.safeParse(await this.parseBody(resp));
    if (!body.success) throw new Error(`HTTP ${resp.status}: ${method} ${resp.url}`);

    const { error } = body.data;
    throw new Error(typeof error === 'string' ? error : error.message);
  }

  private static serializeHeaders(headers: RequestHeaders = {}): Record<string, string> {
    return Object.fromEntries(
      Object.entries(headers)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    );
  }
}
