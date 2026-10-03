import { AddBarMemberDTO, BarWithRoleDTO, GetBarMemberDTO } from '@repo/dtos';
import { Styx } from '~/utils/request';

export class BarAPI {
  private membersApi = new BarMembersAPI();

  public async list() {
    return await Styx.get('/api/bars/list', BarWithRoleDTO.array().parse);
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

  public async add(barId: string, body: AddBarMemberDTO) {
    return await Styx.post(`/api/bars/${barId}/members`, { body });
  }

  public async remove(barId: string, userId: string) {
    return await Styx.delete(`/api/bars/${barId}/members/${userId}`);
  }
}
