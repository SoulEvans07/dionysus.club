import { CreateTagDTO, IdRespDTO, TagDTO, UpdateTagDTO } from '@repo/dtos';
import { Styx } from '~/utils/request';

export class TagAPI {
  public async list(barId: string) {
    return await Styx.get(`/api/bars/${barId}/tags/list`, TagDTO.array().parse);
  }

  public async create(barId: string, body: CreateTagDTO) {
    return await Styx.post(`/api/bars/${barId}/tags/create`, { body }, TagDTO.parse);
  }

  public async update(barId: string, body: UpdateTagDTO) {
    return await Styx.put(`/api/bars/${barId}/tags/update`, { body }, IdRespDTO.parse);
  }

  public async remove(barId: string, id: string) {
    return await Styx.delete(`/api/bars/${barId}/tags/${id}`);
  }
}
