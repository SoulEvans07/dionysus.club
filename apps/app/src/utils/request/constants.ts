import { H } from './headers';
import type { Parser } from './types';

export const defaultHeaders: HeadersInit = {
  [H.ContentType]: 'application/json',
};

export const noopParse: Parser<undefined> = () => {};
