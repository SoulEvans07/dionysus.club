import { BarWithRoleDTO, DiscoverBarDTO, GetBarMemberDTO, type DiscoverBarsQueryParams } from '@repo/dtos';
import { Styx } from '~/utils/request';

export class BarAPI {
  private membersApi = new BarMembersAPI();

  public async list() {
    return await Styx.get('/api/bars/list', BarWithRoleDTO.array().parse);
  }

  public async discover(query?: DiscoverBarsQueryParams) {
    return await Styx.get('/api/bars/discover', { query }, DiscoverBarDTO.array().parse);
  }

  public async get(barId: string) {
    return await Styx.get(`/api/bars/${barId}`, BarWithRoleDTO.parse);
  }

  public get members() {
    return this.membersApi;
  }
}

class BarMembersAPI {
  public async list(barId: string) {
    return await Styx.get(`/api/bars/${barId}/members`, GetBarMemberDTO.array().parse);
  }
}
