import { IngredientDTO } from '@repo/dtos';
import { Styx } from '~/utils/request';
import type { QueryParams } from '~/types/url';

export class IngredientAPI {
  public async list(barId: string, query?: QueryParams) {
    return await Styx.get(`/api/bars/${barId}/ingredients/list`, { query }, IngredientDTO.array().parse);
  }

  public async get(barId: string, id: string) {
    return await Styx.get(`/api/bars/${barId}/ingredients/${id}`, IngredientDTO.parse);
  }
}
