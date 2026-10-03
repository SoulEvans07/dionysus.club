import { BarWithRoleDTO, CreateBarDTO, GetBarMemberDTO, IdRespDTO } from '@repo/dtos';
import { Styx } from '~/utils/request';

export class BarAPI {
  private membersApi = new BarMembersAPI();

  public async list() {
    return await Styx.get('/api/bars/list', BarWithRoleDTO.array().parse);
  }

  public async get(barId: string) {
    return await Styx.get(`/api/bars/${barId}`, BarWithRoleDTO.parse);
  }

  public async create(body: CreateBarDTO) {
    return await Styx.post('/api/bars/create', { body }, IdRespDTO.parse);
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
