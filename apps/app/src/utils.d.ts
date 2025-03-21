declare type Exact<T> = {
  [K in keyof T]: T[K] extends object ? Exact<T[K]> : T[K];
} & {};

// prettier-ignore
declare type DeepPartial<T> = T extends Record<string, unknown>
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

declare type RemoveSymbols<T extends object> = {
  [Key in keyof T extends string ? keyof T : never]: T[Key];
};

// prettier-ignore
declare type MakePartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

declare type Swap<T, K extends keyof T, Replace extends Partial<Record<K, unknown>>> = Omit<T, K> & Replace;

declare type Shift<T extends Array<unknown>> = T extends [unknown, ...infer Rest] ? Rest : [];
