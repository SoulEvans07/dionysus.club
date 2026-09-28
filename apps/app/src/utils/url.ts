type Primitive = boolean | number | string;
type QueryParams = Record<string, Primitive | Primitive[] | undefined | null>;

export class Ariadne {
  public static merge(url: string, query?: QueryParams): string {
    if (!query) return url;

    const params = this.buildParams(query);
    if (!params) return url;

    const bridge = url.includes('?') ? '&' : '?';
    return `${url}${bridge}${params}`;
  }

  private static buildParams(query: QueryParams): URLSearchParams | undefined {
    const entries = Object.entries(query);
    if (entries.length === 0) return undefined;

    const params = new URLSearchParams();
    entries.forEach(([key, value]) => {
      if (value === undefined) return;

      if (value === null) {
        params.append(key, 'null');
      } else if (Array.isArray(value)) {
        value.forEach((item) => params.append(key, item.toString()));
      } else {
        params.append(key, value.toString());
      }
    });

    if (params.size === 0) return undefined;
    return params;
  }
}
