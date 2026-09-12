import { AuthAPI } from './auth';
import { SidebarAPI } from './sidebar';
import { BarAPI } from './bar';
import { IngredientAPI } from './ingredient';
import { CocktailAPI } from './cocktail';

export const api = {
  auth: new AuthAPI(),
  sidebar: new SidebarAPI(),
  bars: new BarAPI(),
  ingredients: new IngredientAPI(),
  cocktails: new CocktailAPI(),
};
