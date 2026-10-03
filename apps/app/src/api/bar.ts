import { BarWithRoleDTO, GetBarMemberDTO, IdRespDTO, UpdateBarDTO, UpdateBarVisibilityDTO } from '@repo/dtos';
import { Styx } from '~/utils/request';

export class BarAPI {
  private membersApi = new BarMembersAPI();

  public async list() {
    return await Styx.get('/api/bars/list', BarWithRoleDTO.array().parse);
  }

  public async get(barId: string) {
    return await Styx.get(`/api/bars/${barId}`, BarWithRoleDTO.parse);
  }

  public async update(barId: string, body: UpdateBarDTO) {
    return await Styx.put(`/api/bars/${barId}`, { body }, IdRespDTO.parse);
  }

  public async setVisibility(barId: string, body: UpdateBarVisibilityDTO) {
    return await Styx.put(`/api/bars/${barId}/visibility`, { body }, IdRespDTO.parse);
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
