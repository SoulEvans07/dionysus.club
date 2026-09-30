import {
  CreateIngredientDTO,
  IdRespDTO,
  IngredientDTO,
  SetIngredientAvailabilityRespDTO,
  UpdateIngredientDTO,
} from '@repo/dtos';
import { Styx } from '~/utils/request';
import type { QueryParams } from '~/types/url';

export class IngredientAPI {
  public async list(barId: string, query?: QueryParams) {
    return await Styx.get(`/api/bars/${barId}/ingredients/list`, { query }, IngredientDTO.array().parse);
  }

  public async get(barId: string, id: string) {
    return await Styx.get(`/api/bars/${barId}/ingredients/${id}`, IngredientDTO.parse);
  }

  public async create(barId: string, body: CreateIngredientDTO) {
    return await Styx.post(`/api/bars/${barId}/ingredients/create`, { body }, IdRespDTO.parse);
  }

  public async update(barId: string, body: UpdateIngredientDTO) {
    return await Styx.put(`/api/bars/${barId}/ingredients/update`, { body }, IdRespDTO.parse);
  }

  public async setAvailability(barId: string, id: string, available: boolean) {
    return await Styx.put(
      `/api/bars/${barId}/ingredients/${id}/availability`,
      { body: { available } },
      SetIngredientAvailabilityRespDTO.parse
    );
  }
}
