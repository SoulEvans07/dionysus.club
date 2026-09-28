import { TagDTO } from '@repo/dtos';
import { Styx } from '~/utils/request';

export class TagAPI {
  public async list(barId: string) {
    return await Styx.get(`/api/bars/${barId}/tags/list`, TagDTO.array().parse);
  }
}
