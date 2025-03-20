import * as schema from './schema';

export type PickRelation<T extends string> = T extends `${string}Relations` ? T : never;
export type PickEnum<T extends string> = T extends `${string}Enum` ? T : never;
export type SchemaKey = keyof typeof schema;
export type Relations = PickRelation<SchemaKey>;
export type Enums = PickEnum<SchemaKey>;
export type Table = Exclude<SchemaKey, Relations | Enums>;
