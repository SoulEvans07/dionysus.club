import { MyBarListDTO } from '@repo/dtos';

export class BarAPI {
  public async list() {
    const resp = await fetch('/api/bars/list');

    if (!resp.ok) throw new Error(`HTTP ${resp.status}: Failed to fetch bar list`);

    const data = await resp.json();
    return MyBarListDTO.array().parse(data);
  }
}
