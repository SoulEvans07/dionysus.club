import { CocktailDTO, type CreateCocktailDTO, type UpdateCocktailDTO } from '@repo/dtos';
import { sendJson } from './http';
import { QueryParams } from '~/types/url';
import { UrlUtils } from '~/utils/url';

export class CocktailAPI {
  public async list(barId: string, query?: QueryParams) {
    const url = UrlUtils.merge(`/api/bars/${barId}/cocktails/list`, query);
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: Failed to fetch cocktail list`);

    const data = await resp.json();
    return CocktailDTO.array().parse(data);
  }

  public async get(barId: string, id: string) {
    const resp = await fetch(`/api/bars/${barId}/cocktails/${id}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: Failed to fetch cocktail ${id}`);

    const data = await resp.json();
    return CocktailDTO.parse(data);
  }

  public async create(barId: string, body: CreateCocktailDTO) {
    return sendJson(`/api/bars/${barId}/cocktails/create`, 'POST', body, 'Failed to create cocktail');
  }

  public async update(barId: string, body: UpdateCocktailDTO) {
    return sendJson(`/api/bars/${barId}/cocktails/update`, 'PUT', body, 'Failed to update cocktail');
  }
}
