export type ID = string; // UUID
export type Identifiable = { id: ID };

export type BarRoles = 'admin' | 'bartender' | 'guest';

export type Entity = Identifiable & {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type FullEntity = Entity & {
  createdBy: User['id'];
  updatedBy: User['id'];
  deletedBy: User['id'] | null;
};

/**
 * The same image (by url) can be referenced by multiple entities (sharing etc).
 * To preserve the original uploader, the createdBy will always be the uploader, while updatedBy will correspond to the entity that the image's entity got shared with.
 * So if user Alice creates a cocktail and uploads an image and then shares that cocktail with user Bob, the image will only be stored once, but 2 ImageBlob entities will exist
 * Alice version will have createdBy = Alice, updatedBy = Alice, while Bob's version will have createdBy = Alice, updatedBy = Bob.
 * This way, if Bob deletes the cocktail, the image will still exist for Alice's cocktail.
 * If Alice deltes the cocktail we still know from Bob's version that Alice was the original uploader, so we can use this for compliance and attribution purposes.
 */
export type ImageBlob = FullEntity & {
  filename: string;
  url: string;
};

export type User = Entity & {
  kindeId: string;
  email: string; // uniq
  username: string; // uniq
  profileImageId: ImageBlob['id'] | null;
};

export type BarType = 'public' | 'private' | 'personal';

export type Bar = FullEntity & {
  createdBy: User['id'];
  ownedBy: User['id'];
  name: string;
  slogan: string; // tagline for the bar under the name
  description: string;
  logoImageId: ImageBlob['id'] | null;
  bannerImageId: ImageBlob['id'] | null;
};

export type BarUserRelationship = {
  barId: Bar['id'];
  userId: User['id'];
  role: BarRoles;
};

export type LiquidUnits = 'ml' | 'cl' | 'dl' | 'l' | 'tsp' | 'tbsp';
export type SolidUnits = 'mg' | 'g' | 'dkg' | 'kg';
export type MiscUnits = 'pcs' | 'slices' | 'pinch' | 'dash';
export type Units = LiquidUnits | SolidUnits | MiscUnits;
export type UnitTypes = '#liquid' | '#solid' | '#misc';

export type Ingredient = FullEntity & {
  barId: Bar['id'];
  name: string;
  description: string;
  units: (UnitTypes | Units)[];
  tags: string[]; // TODO: move to a separate table; add nested tags
  iconImageId: ImageBlob['id'] | null;
  cardImageId: ImageBlob['id'] | null;
};

export type Cocktail = FullEntity & {
  barId: Bar['id'];
  name: string;
  description: string;
  tags: string[]; // TODO: move to a separate table; add nested tags
  iconImageId: ImageBlob['id'] | null;
  cardImageId: ImageBlob['id'] | null;
};

export type RecipeIngredient = {
  cocktailId: Cocktail['id'];
  ingredientId: Ingredient['id'];
  index: number;
  unit: Units;
  quantity: number;
  isOptional: boolean;
  isGarnish: boolean;
};

// TODO: consider instruction groups
export type RecipeInstructionStep = {
  cocktailId: Cocktail['id'];
  index: number;
  // TODO: for description: support markdown + refs to ingredients,
  // e.g. "Add 50ml of [Lime Juice](ingredient:lime-juice)"
  description: string;
  imageId: ImageBlob['id'] | null; // opened as accordion content
};

// --------------------------------------------------------------------
// Event & Menu system
// --------------------------------------------------------------------

// TODO: still not sure if I want to implement this.
// export type Event = FullEntity & {
//   barId: Bar['id'];
//   name: string;
//   description: string;
//   bannerImageId: ImageBlob['id'] | null;
//   startDate: Date;
//   endDate: Date;
// };

export type Menu = FullEntity & {
  barId: Bar['id'];
  title: string;
  subtitle: string;
};

export type MenuItem = {
  menuId: Menu['id'];
  cocktailId: Cocktail['id'];
  menuGroupId: MenuGroup['id'] | null; // used for manual grouping, regardless if group filter selects it.
};

export type MenuGroup = Identifiable & {
  menuId: Menu['id'];
  index: number;
  title: string;
  description: string;
  // TODO: implement a filter language to filter cocktails by tags, ingredients, etc.
  // filter: string;
};

// --------------------------------------------------------------------
// Share system
// --------------------------------------------------------------------

// TODO: still not sure how to implement live shares so lets deffer this feature
export type ShareLinkType = 'copy'; // | 'reference' | 'fork';

// create a share link for one or more cocktails
// which expires after a certain time and only can be claimed by one user
export type ShareLink = Identifiable & {
  createdAt: Date;
  createdBy: User['id'];
  expiresAt: Date;
  type: ShareLinkType;
};

export type ShareLinkCocktail = {
  shareLinkId: ShareLink['id'];
  cocktailId: Cocktail['id'];
};

export type ShareLinkIngredient = {
  shareLinkId: ShareLink['id'];
  ingredientId: Ingredient['id'];
};
