import { IngredientDTO, type CreateIngredientDTO, type UpdateIngredientDTO } from '@repo/dtos';
import { sendJson } from './http';
import type { QueryParams } from '~/types/url';
import { UrlUtils } from '~/utils/url';

export class IngredientAPI {
  public async list(barId: string, query?: QueryParams) {
    const url = UrlUtils.merge(`/api/bars/${barId}/ingredients/list`, query);
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: Failed to fetch ingredient list`);

    const data = await resp.json();
    return IngredientDTO.array().parse(data);
  }

  public async get(barId: string, id: string) {
    const resp = await fetch(`/api/bars/${barId}/ingredients/${id}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: Failed to fetch ingredient ${id}`);

    const data = await resp.json();
    return IngredientDTO.parse(data);
  }

  public async create(barId: string, body: CreateIngredientDTO) {
    return sendJson(`/api/bars/${barId}/ingredients/create`, 'POST', body, 'Failed to create ingredient');
  }

  public async update(barId: string, body: UpdateIngredientDTO) {
    return sendJson(`/api/bars/${barId}/ingredients/update`, 'PUT', body, 'Failed to update ingredient');
  }
}
