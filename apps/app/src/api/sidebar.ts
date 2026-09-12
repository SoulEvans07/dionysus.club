import { SidebarDTO } from '@repo/dtos';

export class SidebarAPI {
  public async get() {
    const resp = await fetch('/api/sidebar');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: Failed to fetch sidebar`);

    const data = await resp.json();
    return SidebarDTO.parse(data);
  }
}
