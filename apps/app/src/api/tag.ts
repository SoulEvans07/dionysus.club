import { TagDTO } from '@repo/dtos';

export class TagAPI {
  public async list(barId: string) {
    const resp = await fetch(`/api/bars/${barId}/tags/list`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: Failed to fetch tags list`);

    const data = await resp.json();
    return TagDTO.array().parse(data);
  }
}
