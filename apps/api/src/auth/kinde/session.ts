import { type SessionManager } from '@kinde-oss/kinde-typescript-sdk';
import { type Context } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';

export const sessionManager = (c: Context): SessionManager => ({
  async getSessionItem(key: string) {
    const result = getCookie(c, key);
    console.log('sm.get', key, '=', result);
    return result;
  },
  async setSessionItem(key: string, value: unknown) {
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
    } as const;

    if (typeof value === 'string') {
      console.log('sm.set', key, value);
      setCookie(c, key, value, cookieOptions);
    } else {
      console.log('sm.set', key, JSON.stringify(value));
      setCookie(c, key, JSON.stringify(value), cookieOptions);
    }
  },
  async removeSessionItem(key: string) {
    console.log('sm.remove', key);
    deleteCookie(c, key);
  },
  async destroySession() {
    console.log('sm.destroy');

    ['id_token', 'access_token', 'user', 'refresh_token'].forEach((key) => {
      deleteCookie(c, key);
    });
  },
});
