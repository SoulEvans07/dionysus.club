import { CocktailDTO } from '@repo/dtos';

export class CocktailAPI {
  public async list(barId: string) {
    const resp = await fetch(`/api/bars/${barId}/cocktails/list`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: Failed to fetch cocktail list`);

    const data = await resp.json();
    return CocktailDTO.array().parse(data);
  }
}
