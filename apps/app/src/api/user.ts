import { PublicUserDTO } from '@repo/dtos';
import { Styx } from '~/utils/request';

export class UserAPI {
  public async search(q: string) {
    return await Styx.get('/api/users/search', { query: { q } }, PublicUserDTO.array().parse);
  }
}
