type BaseEntity = { id: string };

export function makePlaceholderList<T extends BaseEntity>(size: number, base: T): T[] {
  return new Array(size).fill(base).map((o, i) => ({ ...o, id: `${o.id}-${i}` }));
}
