import { BarWithRoleDTO, GetBarMemberDTO } from '@repo/dtos';

export class BarAPI {
  private membersApi = new BarMembersAPI();

  public async list() {
    const resp = await fetch('/api/bars/list');

    if (!resp.ok) throw new Error(`HTTP ${resp.status}: Failed to fetch bar list`);

    const data = await resp.json();
    return BarWithRoleDTO.array().parse(data);
  }

  public async get(barId: string) {
    const resp = await fetch(`/api/bars/${barId}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: Failed to fetch bar ${barId}`);

    const data = await resp.json();
    return BarWithRoleDTO.parse(data);
  }

  public get members() {
    return this.membersApi;
  }
}

class BarMembersAPI {
  public async list(barId: string) {
    const resp = await fetch(`/api/bars/${barId}/members`);

    if (!resp.ok) throw new Error(`HTTP ${resp.status}: Failed to fetch bar list`);

    const data = await resp.json();
    return GetBarMemberDTO.array().parse(data);
  }
}
