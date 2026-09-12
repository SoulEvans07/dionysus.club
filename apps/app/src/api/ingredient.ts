import { IngredientDTO } from '@repo/dtos';

export class IngredientAPI {
  public async list(barId: string) {
    const resp = await fetch(`/api/bars/${barId}/ingredients/list`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: Failed to fetch ingredient list`);

    const data = await resp.json();
    return IngredientDTO.array().parse(data);
  }
}
