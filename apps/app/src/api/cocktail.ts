import { CocktailDTO } from '@repo/dtos';

export class CocktailAPI {
  public async list(barId: string) {
    const resp = await fetch(`/api/bars/${barId}/cocktails/list`);
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
}
