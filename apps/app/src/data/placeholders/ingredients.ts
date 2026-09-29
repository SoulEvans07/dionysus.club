import { IngredientDTO } from '@repo/dtos';

const placeholderIngredient: IngredientDTO = {
  id: 'placeholder-ingredient',
  name: 'xxxxxx',
  description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit.',
  available: true,
  tags: [],
  iconImage: null,
  cardImage: null,
};

const rand = (max: number) => Math.round(Math.random() * max);
const randStr = (max: number) => new Array(rand(max)).fill('x').join('');

export const ingredients = {
  single: placeholderIngredient,
  list: new Array(15).fill(placeholderIngredient).map((o, i) => {
    const letter = String.fromCharCode(97 + rand(5));
    const name = `${letter}xxxxxxx${randStr(6)}`;
    const description = `xxxxxxxxxxxxxxxxxxxxx${randStr(5)}`;

    return { ...o, id: `${o.id}-${i}`, name, description };
  }),
};
