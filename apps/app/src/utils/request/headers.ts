export const H = {
  Accept: 'Accept',
  Authorization: 'Authorization',
  ContentType: 'Content-Type',
  ContentLength: 'Content-Length',
  UserAgent: 'User-Agent',
  // ...
} as const;
export type BasicHeaders = (typeof H)[keyof typeof H];
