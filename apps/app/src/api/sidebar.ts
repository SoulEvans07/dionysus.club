import { SidebarDTO } from '@repo/dtos';
import { Styx } from '~/utils/request';

export class SidebarAPI {
  public async get() {
    return await Styx.get('/api/sidebar', SidebarDTO.parse);
  }
}
