import { AuthAPI } from './auth';
import { BarAPI } from './bar';
import { SidebarAPI } from './sidebar';

export const api = {
  auth: new AuthAPI(),
  sidebar: new SidebarAPI(),
  bar: new BarAPI(),
};
