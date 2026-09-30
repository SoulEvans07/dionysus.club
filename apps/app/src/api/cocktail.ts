import { CocktailDTO, CreateCocktailDTO, UpdateCocktailDTO, IdRespDTO } from '@repo/dtos';
import { Styx } from '~/utils/request';
import { QueryParams } from '~/types/url';

export class CocktailAPI {
  public async list(barId: string, query?: QueryParams) {
    return await Styx.get(`/api/bars/${barId}/cocktails/list`, { query }, CocktailDTO.array().parse);
  }

  public async get(barId: string, id: string) {
    return await Styx.get(`/api/bars/${barId}/cocktails/${id}`, CocktailDTO.parse);
  }

  public async create(barId: string, body: CreateCocktailDTO) {
    return await Styx.post(`/api/bars/${barId}/cocktails/create`, { body }, IdRespDTO.parse);
  }

  public async update(barId: string, body: UpdateCocktailDTO) {
    return await Styx.put(`/api/bars/${barId}/cocktails/update`, { body }, IdRespDTO.parse);
  }
}
