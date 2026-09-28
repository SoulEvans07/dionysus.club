import { CocktailDTO } from '@repo/dtos';
import { Styx } from '~/utils/request';
import { QueryParams } from '~/types/url';

export class CocktailAPI {
  public async list(barId: string, query?: QueryParams) {
    return await Styx.get(`/api/bars/${barId}/cocktails/list`, { query }, CocktailDTO.array().parse);
  }

  public async get(barId: string, id: string) {
    return await Styx.get(`/api/bars/${barId}/cocktails/${id}`, CocktailDTO.parse);
  }
}
