import { AuthAPI } from './auth';
import { BarAPI } from './bar';

export const api = {
  auth: new AuthAPI(),
  bar: new BarAPI(),
};
